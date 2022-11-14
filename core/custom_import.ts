
import * as path from "https://deno.land/std@0.163.0/path/mod.ts";
import { encode } from "https://deno.land/std@0.99.0/encoding/base64.ts";

const genImport = (code: string) => new URL(`data:application/typescript;base64,${encode(code)}`)

const template = (path: string, resolved: string) => "  " + `
  "${path}": {
    path: "${resolved}",
    code: () => import("${resolved}")
  },
`.trim()


const wrapper = (inner: string) => `
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

const { library } = await import('../import_library.ts').catch(() => ({ library: undefined }))

export type RawLibraryType = typeof library
export type LibraryType = NonNullable<RawLibraryType>
export type LibraryKeys = keyof LibraryType
export type LibraryImport<K extends LibraryKeys> = Awaited<ReturnType<LibraryType[K]['code']>>

const touchFile = async (file: string) => {
  try {
    await Deno.open(file);
  } catch(e) {
    if(e instanceof Deno.errors.NotFound)
      await Deno.create(file);
  }
}

export async function customImport <K extends LibraryKeys>(metaUrl: string, p: K, fn: (p: string, c: () => Promise<unknown>) => unknown) {
  const lib = library ? library : {} as LibraryType
  const pInternal: string = p as string
  const resolve = (v: string) => path.resolve(path.dirname(metaUrl.replace('file://', '')), v)
  if (p in lib) return fn(lib[p].path, lib[p].code)
  const importLibraryJSON = resolveHere('../import_library.json')
  await touchFile(importLibraryJSON)
  const data = await Deno.readTextFile(importLibraryJSON)
  const value = data === '' ? {} : JSON.parse(data)
  const importLibrary: ImportLibraryJSON = value;
  const newPath = resolve(pInternal)
  const updatedImportLibrary = { ...importLibrary, [pInternal]: { path: newPath, asUsed: pInternal }}
  const inner = Object.values(updatedImportLibrary).map(v => template(v.asUsed, v.path)).join('\n')
  const importLibaryTS = wrapper(inner)
  await Promise.all([
    Deno.writeTextFile(importLibraryJSON, JSON.stringify(updatedImportLibrary, null, 2)),
    Deno.writeTextFile(resolveHere('../import_library.ts'), importLibaryTS)
  ])
  return fn(newPath, () => import(newPath))
}