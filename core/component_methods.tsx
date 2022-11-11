// deno-lint-ignore-file no-explicit-any

import { JSX } from "preact";
import { useId } from "preact/hooks";
import { HTMXProps } from "../htmx/htmx_props.ts";
import * as HTMX from '../htmx/htmx.tsx'
import { nanoid } from "nanoid";
import { ComponentmethodConvience, componentMethodConvience, PropsToUrl } from "./method_convience.tsx";
import { WrapperType } from "./htmx_components.tsx";
import { compile } from 'https://esm.sh/path-to-regexp'

export type Constructor = new (...args: any[]) => any;
export type GenericProps = Record<string, unknown>;
export type HTMXContext = { request: Request, id?: string, className?: string, data?: any }
export type GC<C extends GenericProps> = (props: C, context: HTMXContext) => JSX.Element
export type AGC<C extends GenericProps> = (props: C, context: HTMXContext) => Promise<JSX.Element>
export type GenericComponent<C extends GenericProps> = GC<C> | AGC<C>
export type ComponentWithHTMXProps<C extends GenericProps = any> = GenericComponent<C & JSX.HTMLAttributes<any> & HTMXProps>

export class ComponentMethods<C extends GenericProps> {
  instance: ComponentMethods<C>
  Component: GC<C>
  button: ComponentmethodConvience<C, HTMLButtonElement>
  a: ComponentmethodConvience<C, HTMLAnchorElement>
  anchor: ComponentmethodConvience<C, HTMLAnchorElement>
  form: ComponentmethodConvience<C, HTMLFormElement>
  iframe: ComponentmethodConvience<C, HTMLIFrameElement>

  href: string
  put: { "hx-put": string }
  get: { "hx-get": string }
  post: { "hx-post": string }
  delete: { "hx-delete": string }
  urlPattern: URLPattern
  className: string
  path: string
  propsToUrl: PropsToUrl<C>
  constructor(
    _path?: string,
    _Component?: GenericComponent<C>,
    _propsToUrl?: PropsToUrl<C>,
    public wrapper?: WrapperType,
    public context: any = {}
  ) {
    this.className = `hx${nanoid(5)}`
    this.Component = _Component as GC<C>
    this.instance = this 
    this.path = _path || ""
    this.urlPattern = new URLPattern({pathname: this.path})
    this.propsToUrl = _propsToUrl ?? ((_props, path, ctx: any, query) => {
      const result = ctx.data.nestPath ? `${ctx.data.nestPath}${path}` : path
      const toPath = compile(result)
      const core = toPath(_props)
      const q = new URLSearchParams(query).toString();
      return (q) ? core + "?" + q : core
    })
    this.button = componentMethodConvience<C>(this.path, this.propsToUrl)(HTMX.button)
    this.form = componentMethodConvience<C>(this.path, this.propsToUrl)(HTMX.form)
    this.a = componentMethodConvience<C>(this.path, this.propsToUrl)(HTMX.a)
    this.iframe = componentMethodConvience<C>(this.path, this.propsToUrl)(HTMX.iframe)
    this.anchor = this.a
    this.href = this.path
    this.put = {"hx-put": this.path}
    this.get = {"hx-get": this.path}
    this.post = {"hx-post": this.path}
    this.delete = {"hx-delete": this.path}
    this.Wrap = this.Wrap.bind(this)
    this.getPath = this.getPath.bind(this)
  }
  getPath (ctx: any, props: C, query: any) {
    return this.propsToUrl(props, this.path, ctx, query)
  }
  clone (context: any = {}) {
    return new ComponentMethods<C>(`${context.nestPath}${this.path}`, this.Component, this.propsToUrl, this.wrapper, {...this.context, data: {...this.context.data, ...context }})
  }
  Wrap (props: C, context: HTMXContext) {
    const pid = useId()
    context.id = `${this.className}-${pid}`
    context.className = this.className
    const Component = this.Component
    const WrapElement = this.wrapper
    if (WrapElement) {
      return (
        <WrapElement>
          <Component {...{...props}}/>
        </WrapElement>
      )
    }
    return <Component {...{...props}}/>
  }
}
