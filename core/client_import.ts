import { constructImport } from "./construct.ts";
import { customImport, LibraryImport, LibraryKeys } from "./custom_import.ts";

export function _clientImport <G>(
  path: string,
  code: () => Promise<G>
) {
  const construct = constructImport(code)
  return { path, construct, code }
}

interface ClientImport<G> {
  path: string;
  construct: G;
  code: () => Promise<G>;
}

export function clientImport<K extends LibraryKeys>(metaUrl: string, p: K): Promise<ClientImport<LibraryImport<K>>> {
  return customImport(metaUrl, p, _clientImport) as Promise<ClientImport<LibraryImport<K>>>;
}