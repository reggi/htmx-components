import { getEntryId } from '../esbuild/bundle.ts';
import * as nodePath from "https://deno.land/std@0.163.0/path/mod.ts";

export abstract class RouteFile {
  abstract TYPE: string
  abstract urlPattern: URLPattern
}

export class BundleFile extends RouteFile {
  TYPE = 'bundle_file'
  entry: { id: string, url: string }
  urlPattern: URLPattern
  bundleId: string
  constructor (path: string) {
    super()
    const pieces = bundlePieces(path)
    
    this.entry = pieces.entry
    this.bundleId = pieces.pathname
    this.urlPattern = new URLPattern({ pathname: pieces.pathname })
  }
}

/** this is the public pathname the javascript file will live */
export function bundleShared (path: string) {
  const arrA = Deno.cwd().split(nodePath.SEP)
  const arrB = path.split(nodePath.SEP)
  const sharedParts = arrA.filter(x => arrB.includes(x))
  const shared = nodePath.join('/', ...sharedParts)
  return shared.replace(/ts$/, 'js')
}

/** this is the public pathname the javascript file will live */
export function bundleCore (path: string) {
  const shared = bundleShared(path)
  return path.replace(shared, '').replace(/[^a-z0-9]/gi, '-').replace(/-+/, '-').replace(/ts/, '').replace(/^-/, '').replace(/-$/, '')
}

export function bundlePieces (path: string) {
  const core = bundleCore(path)
  const entry = { id: core, url: path }
  const entryId = getEntryId(entry);
  const pathname = `/${entryId}.js`
  return { core, entry, entryId, pathname }
}