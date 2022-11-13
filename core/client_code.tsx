// deno-lint-ignore-file no-explicit-any

import { parse } from 'https://deno.land/std@0.150.0/path/mod.ts';
import { VNode } from 'preact'
import { getEntryId } from '../esbuild/bundle.ts';
import { HTMX } from '../mod.tsx';
import { GenericProps } from './component_methods.tsx';
import { ComponentmethodConvience, componentMethodConvience } from './method_convience.tsx';

export class ClienCodeHarness<T extends GenericProps> {
  TYPE = "CLIENT_CODE" as const;
  entry: { id: string, url: string }
  entryId: string
  externalId: string
  externalPath: string
  urlPattern: URLPattern
  fn: string

  div: ComponentmethodConvience<T, HTMLDivElement>

  constructor (
    public path: string,
    public _fn?: string
  ) {
    this.fn = _fn ? _fn : parse(path).name;
    this.entry = { id: this.fn, url: path }
    this.entryId = getEntryId(this.entry);
    this.externalId = `/${this.entryId}.js`
    this.externalPath = `/${this.entryId}.js`
    this.urlPattern = new URLPattern({ pathname: this.externalPath })

    const propsToUrl = ((_componentProps: any, fn: string, ctx: any, props: any) => {
      return `${fn}(${ Object.keys(props).length ? JSON.stringify(props) : ''})`
    })
    this.div = componentMethodConvience<T>(this.fn, propsToUrl)(HTMX.div)

    this.run = this.run.bind(this)
    this.scriptModule = this.scriptModule.bind(this)
    this.script = this.script.bind(this)
  }
  script () {
    return <script src={this.externalPath}></script>
  }
  scriptModule () {
    return <script type={"module"} src={this.externalPath}></script>
  }
  run (props?: T) {
    return `${this.fn}(${ props ? JSON.stringify(props) : ''})`
  }
}

export interface ClientCode<P extends Record<string, unknown> = any> extends ClienCodeHarness<P> {
  (props: P): VNode<any>
}

export function defineClientCode <P extends Record<string, unknown>>(opts: string | {
  fn?: string,
  path: string
}) {
  const path = typeof opts == 'string' ? opts : opts.path
  const fn = typeof opts == 'string' ? undefined : opts.fn
  const instance = new ClienCodeHarness(path, fn);
  function Component (props: P) {
    return (
      <script type="module">{`
        import ${instance.fn} from '${instance.externalPath}'
        ${instance.fn}(${JSON.stringify(props)})
      `}</script>
    )
  }
  return Object.assign(Component, instance)
}

export const isClientCode = (x: any): x is ClientCode => {
  return x && "TYPE" in x && x.TYPE == "CLIENT_CODE"
}