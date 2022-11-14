// deno-lint-ignore-file no-explicit-any

import * as path from "https://deno.land/std@0.163.0/path/mod.ts";
import { encode } from "https://deno.land/std@0.99.0/encoding/base64.ts";
import { constructImport } from './construct.ts'

const genImport = (code: string) => new URL(`data:application/typescript;base64,${encode(code)}`)

const template = (path: string, resolved: string) => "  " + `
  "${path}": {
    path: "${resolved}",
    code: () => import("${resolved}")
  },
`.trim()

interface ImportLibraryJSON {
  [key: string]: {
    path: string,
    asUsed: string
  }
}

export function _clientImport <G>(
  path: string,
  code: () => Promise<G>
) {
  const construct = constructImport(code)
  return { path, construct, code }
}

interface ClientImportReturnType<G> {
  path: string;
  construct: G;
  code: () => Promise<G>;
}

const wrapper = (inner: string) => `
export const library = {
${inner}
}
`

const resolveHere = (v: string) => {
  return path.resolve(path.dirname(import.meta.url.replace('file://', '')), v)
}

const { library } = await import('../import_library.ts').catch(() => ({ library: undefined }))

export type RawLibraryType = typeof library
export type LibraryType = NonNullable<RawLibraryType>
export type LibraryKeys = keyof LibraryType

const touchFile = async (file: string) => {
  try {
    await Deno.open(file);
  } catch(e) {
    if(e instanceof Deno.errors.NotFound)
      await Deno.create(file);
  }
}

export async function clientImport <K extends keyof NonNullable<typeof library>>(metaUrl: string, p: K): Promise<ClientImportReturnType<Awaited<ReturnType<NonNullable<typeof library>[K]['code']>>>> {
  const lib = library ? library : {} as NonNullable<typeof library>;
  const pInternal: string = p as string
  const resolve = (v: string) => path.resolve(path.dirname(metaUrl.replace('file://', '')), v)
  if (p in lib) return _clientImport(lib[p].path, lib[p].code) as any
  const importLibraryJSON = resolveHere('../import_library.json')
  await touchFile(importLibraryJSON)
  const data = await Deno.readTextFile(importLibraryJSON)
  const value = data === '' ? {} : JSON.parse(data)
  const importLibrary: ImportLibraryJSON = value;
  const updatedImportLibrary = { ...importLibrary, [pInternal]: { path: resolve(pInternal), asUsed: pInternal }}
  const inner = Object.values(updatedImportLibrary).map(v => template(v.asUsed, v.path)).join('\n')
  const importLibaryTS = wrapper(inner)
  await Promise.all([
    Deno.writeTextFile(importLibraryJSON, JSON.stringify(updatedImportLibrary, null, 2)),
    Deno.writeTextFile(resolveHere('../import_library.ts'), importLibaryTS)
  ])
  const importLibaryTSBase64 = genImport(importLibaryTS)
  const file = await import(importLibaryTSBase64.href)
  const { library: library2 } = file
  if (p in library2) return _clientImport(library2[p].path, library2[p].code)
  throw new Error(`can not find import ${pInternal}`)
}
