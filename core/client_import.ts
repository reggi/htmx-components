import { constructBundle, constructImport } from "./construct.ts";
import { customImport, LibraryImport, LibraryKeys } from "./custom_import.ts";
import { fileName, metaUrl } from "./meta_url.ts";
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

// bundle version

export function _bundleImport (fileName: string) {
  return <G>(
    path: string,
    code: () => Promise<G>
  ) => {
    const exports = constructBundle(path, fileName, code)
    return { exports, path }
  }
}

export type BundleImport<G> = { exports: G, path: string}

export function bundleImport<K extends LibraryKeys>(p: K): Promise<ClientImport<LibraryImport<K>>> {
  const file = fileName(p)
  return customImport(metaUrl(), p, _bundleImport(file)) as Promise<ClientImport<LibraryImport<K>>>;
}