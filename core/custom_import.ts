// deno-lint-ignore-file no-explicit-any

import * as path from "https://deno.land/std@0.163.0/path/mod.ts";
// import { encode } from "https://deno.land/std@0.99.0/encoding/base64.ts";
import { metaUrl, removeFilePrefix } from './meta_url.ts'

// const genImport = (code: string) => new URL(`data:application/typescript;base64,${encode(code)}`)
const basePath = path.join(path.dirname(import.meta.url.replace(/^file:\/\//, '')), '..')
const relativeToBasePath = (v: string) => path.relative(basePath, v)

const template = (p: string, resolved: string) => "  " + `
  "${p}": {
    path: \`\${basePath}/${path.relative(basePath, resolved)}\`,
    code: () => import("./${path.relative(basePath, resolved)}")
  },
`.trim()

const wrapper = (inner: string) => `
import * as path from "https://deno.land/std/path/mod.ts";
export const basePath = path.dirname(import.meta.url.replace(/^file:\\/\\//, ''))

export const library = {
${inner}
}
`

interface ImportLibraryJSON {
  [key: string]: {
    path: string,
    asUsed: string
  }
}

const resolveHere = (v: string) => {
  return path.resolve(path.dirname(import.meta.url.replace('file://', '')), v)
}

import { importModule } from '../dynamic_import/mod.ts'

function denoDeployCompatImport <T> (g: string, _maintainTypes: () => Promise<T>): Promise<T> {
  // if (Deno.env.get('DENO_DEPLOYMENT_ID')) {
  //   return importModule(g) as any
  // }
  // return importModule(g) as any
  return importModule(g) as any
}

const { library } = await denoDeployCompatImport('import_library', () => import('../import_library.ts'))
  // .catch(() => ({ library: undefined }))

export type RawLibraryType = typeof library
export type LibraryType = NonNullable<RawLibraryType>
export type LibraryKeys = keyof LibraryType
export type LibraryImport<K extends LibraryKeys> = Awaited<ReturnType<LibraryType[K]['code']>>

const touchFile = async (file: string) => {
  try {
    await Deno.readFile(file);
  } catch(e) {
    if(e instanceof Deno.errors.NotFound)
      await Deno.create(file);
  }
}

export async function customImport <K extends LibraryKeys>(metaUrl: string, p: K, fn: (p: string, c: () => Promise<unknown>) => unknown) {
  const lib = library ? library : {} as LibraryType
  if (p in lib) return fn(lib[p].path, lib[p].code)
  // because the import doesn't exist it won't be typed in lib
  const requestingImport: string = p as string
  const callee = removeFilePrefix(metaUrl)
  const calleeParent = path.dirname(callee)
  const relativeToCallee = (url: string) => path.resolve(calleeParent, url)

  const importLibraryJSON = resolveHere('../import_library.json')
  await touchFile(importLibraryJSON)
  const data = await Deno.readTextFile(importLibraryJSON)
  const importLibrary: ImportLibraryJSON = data === '' ? {} : JSON.parse(data)
  
  const absolutePath = relativeToCallee(requestingImport)
  const relativePath = relativeToBasePath(absolutePath)
  // console.log({ callee, calleeParent, basePath, requestingImport, absolutePath, relativePath})

  const updatedImportLibrary = { ...importLibrary, [requestingImport]: { path: relativePath, asUsed: requestingImport }}
  const inner = Object.values(updatedImportLibrary).map(v => template(v.asUsed, v.path)).join('\n')
  const importLibaryTS = wrapper(inner)
  try {
    await Promise.all([
      Deno.writeTextFile(importLibraryJSON, JSON.stringify(updatedImportLibrary, null, 2)),
      Deno.writeTextFile(resolveHere('../import_library.ts'), importLibaryTS)
    ])
  } catch {
    console.log('failed to write to import_library.ts')
  }
  return fn(absolutePath, () => import(absolutePath))
}