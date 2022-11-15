import { constructImport } from "./construct.ts";
import { customImport, LibraryImport, LibraryKeys } from "./custom_import.ts";
import { metaUrl } from "./meta_url.ts";
export * from "./custom_import.ts";

export function _clientImport <G>(
  path: string,
  code: () => Promise<G>
) {
  const exports = constructImport(path, code)
  return { exports, path }
}

export type ClientImport<G> = { exports: G, path: string}

export function clientImport<K extends LibraryKeys>(p: K): Promise<ClientImport<LibraryImport<K>>> {
  return customImport(metaUrl(), p, _clientImport) as Promise<ClientImport<LibraryImport<K>>>;
}