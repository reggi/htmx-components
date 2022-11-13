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
  constructor (
    public tag: string,
    public path: string
  ) {
    this.entry = { id: tag, url: path }
    this.entryId = getEntryId(this.entry);
    this.externalId = `/${this.entryId}.js`
    this.externalPath = `/${this.entryId}.js`
    this.script = <script src={this.externalPath}></script>
    this.urlPattern = new URLPattern({ pathname: this.externalPath })
  }
}

export interface WebComponent<P extends { props: Record<string, unknown> } = { props: any }> extends WebComponentHarness{
  (props: P['props']): VNode<any>
}

export function defineWebComponent <P extends { props: Record<string, unknown> }>(opts: {
  tag: string,
  path: string
}) {
  const instance = new WebComponentHarness(opts.tag, opts.path)
  function Component (props: P['props']) {
    return createElement(opts.tag, props)
  }
  return Object.assign(Component, instance)
}

export const isWebComponent = (x: any): x is WebComponent => {
  return "TYPE" in x && x.TYPE == "WEB_COMPONENT"
}