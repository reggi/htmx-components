
import { customImport, LibraryImport, LibraryKeys } from "./custom_import.ts";
import { metaUrl } from "./meta_url.ts";

export const IMPORT_PATH = Symbol('IMPORT_PATH')

export async function _embededImport <G>(
  path: string,
  _code: () => Promise<G>
) {
  const x = await import(path)
  return Object.assign({}, x, {[IMPORT_PATH]: path})
}

type EmbededImport<G> = G & { [IMPORT_PATH]: string }

export function embededImport<K extends LibraryKeys>(p: K): Promise<EmbededImport<LibraryImport<K>>> {
  return customImport(metaUrl(), p, _embededImport) as Promise<EmbededImport<LibraryImport<K>>>;
}