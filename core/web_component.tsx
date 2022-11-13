// deno-lint-ignore-file no-explicit-any

import { parse } from 'https://deno.land/std@0.150.0/path/mod.ts';
import { VNode, createElement } from 'preact'
import { getEntryId } from '../esbuild/bundle.ts';

export class WebComponentHarness {
  TYPE = "WEB_COMPONENT" as const;
  entry: { id: string, url: string }
  entryId: string
  externalId: string
  externalPath: string
  script: VNode
  urlPattern: URLPattern
  tag: string
  constructor (
    public path: string,
    public _tag?: string
  ) {
    this.tag = _tag ? _tag : parse(path).name.toLocaleLowerCase().replace(/[^a-z]/gi, '-');
    this.entry = { id: this.tag, url: path }
    this.entryId = getEntryId(this.entry);
    this.externalId = `/${this.entryId}.js`
    this.externalPath = `/${this.entryId}.js`
    this.script = <script src={this.externalPath}></script>
    this.urlPattern = new URLPattern({ pathname: this.externalPath })
  }
}

export interface WebComponent<P extends Record<string, unknown> = any> extends WebComponentHarness{
  (props: P): VNode<any>
}

export function defineWebComponent <P extends Record<string, unknown>>(opts: string | {
  tag?: string,
  path: string
}) {
  const path = typeof opts == 'string' ? opts : opts.path
  const tag = typeof opts == 'string' ? undefined : opts.tag
  const instance = new WebComponentHarness(path, tag)
  function Component (props: P) {
    return createElement(instance.tag, props)
  }
  return Object.assign(Component, instance)
}

export const isWebComponent = (x: any): x is WebComponent => {
  return x && "TYPE" in x && x.TYPE == "WEB_COMPONENT"
}