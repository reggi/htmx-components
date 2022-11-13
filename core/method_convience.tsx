// deno-lint-ignore-file no-explicit-any

/// <reference lib="dom.iterable" />

import { JSX } from "preact";
import { HTMXProps } from "../htmx/htmx_props.ts"
import { ComponentWithHTMXProps, GC, GenericProps } from "./component_methods.tsx"

type CustomProps = { query?: Record<string, any>, useQuery?: boolean }

export function wrapHtmxComponent <C extends GenericProps> () {
  return function <G extends ComponentWithHTMXProps>(Component: G) {
    return function (hopProps: (props: Partial<C>, ctx: any, query: Record<string, any>) => Partial<Parameters<G>[0]>) {
      return (props: Partial<C> & CustomProps & Parameters<G>[0], ctx: any) => {
        let {query, useQuery, ...rest} = props
        if (useQuery) {
          const req = new URL(ctx.request.url)
          query = {...Object.fromEntries(req.searchParams.entries()), ...query}
        }
        const ret = hopProps(props, ctx, query || {})
        const Comp = Component as GC<C> as any
        return <Comp {...{...ret,...rest}}/>
      }
    }
  }
}

export type PropsToUrl<C> = (props: Partial<C>, path: string, ctx: any, query: Record<string, any>) => string

export function componentMethodConvience <C extends GenericProps>(path: string, propsToUrl: PropsToUrl<C>) {
  return function<G extends ComponentWithHTMXProps>(Component: G) {
    return { 
      get: wrapHtmxComponent<C>()(Component)((props, ctx, query) => ({ get: propsToUrl(props, path, ctx, query) })),
      put: wrapHtmxComponent<C>()(Component)((props, ctx, query) => ({ put: propsToUrl(props, path, ctx, query) })),
      post: wrapHtmxComponent<C>()(Component)((props, ctx, query) => ({ post: propsToUrl(props, path, ctx, query) })),
      delete: wrapHtmxComponent<C>()(Component)((props, ctx, query) => ({ delete: propsToUrl(props, path, ctx, query) })),
      href: wrapHtmxComponent<C>()(Component)((props, ctx, query) => ({ href: propsToUrl(props, path, ctx, query) })),
      src: wrapHtmxComponent<C>()(Component)((props, ctx, query) => ({ src: propsToUrl(props, path, ctx, query) })),

      // clientCode
      onClick: wrapHtmxComponent<C>()(Component)((props, ctx, query) => ({ onclick: propsToUrl(props, path, ctx, query) })),
    }
  }
}

type Same<C, Elm extends HTMLElement> = (props: Partial<C> & CustomProps & JSX.HTMLAttributes<Elm> & HTMXProps, ctx: any) => JSX.Element;

export type ComponentmethodConvience<C, Elm extends HTMLElement> = {
  get: Same<C, Elm>
  put: Same<C, Elm>
  post: Same<C, Elm>
  delete: Same<C, Elm>
  href: Same<C, Elm>
  src: Same<C, Elm>

  onClick: Same<C, Elm>
}