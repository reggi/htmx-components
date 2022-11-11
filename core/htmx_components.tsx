// deno-lint-ignore-file no-explicit-any
import { serve as denoServe } from "$std/http/server.ts";
import { ComponentMethods, GC, GenericComponent, GenericProps } from "./component_methods.tsx"
import { Layout } from './layout.tsx'
import render from 'preact-async-render-to-string'
import { PropsToUrl } from './method_convience.tsx';
import { ComponentChildren, JSX } from 'preact'

export type ComponentWithMethods<C extends GenericProps> = GC<C> & ComponentMethods<C>

type ComponentOptions<C> = {
  path?: string
  propsToUrl?: PropsToUrl<C>
  Wrapper?: WrapperType
}

export type WrapperType = (props: { children: ComponentChildren }, context: { id: string, className: string }) => JSX.Element

export const Wrapper: WrapperType = (p, context) => {
  return <span id={context.id} class={context.className}>{p.children}</span>
}

class SimpleRoute {
  constructor (
    public urlPattern: URLPattern,
    public response: Response
  ) {}
}

type Routes = (ComponentMethods<any> | SimpleRoute)[]

export class HTMXComponents {
  // deno-lint-ignore no-explicit-any
  routes: (ComponentMethods<any> | SimpleRoute)[] = []
  constructor (
    public name: string,
    public wrapper = Wrapper
  ) {
    this.component = this.component.bind(this)
    this.serve = this.serve.bind(this)
    this.context = this.context.bind(this)
    this.registryPage = this.registryPage.bind(this)
  }
  registryPage (publicContext: any) {
    const req = new URLPattern({ pathname: `/registry/${this.name}` });
    const res = Response.json(publicContext)
    return new SimpleRoute(req, res)
  }
  serve (routes: Routes) { 
    return denoServe(async (request: Request) => {
      const route = [...this.routes, ...routes].find(route => route.urlPattern.exec(request.url))
      if (route instanceof SimpleRoute) {
        return route.response
      }
      if (route) {
        // deno-lint-ignore no-explicit-any
        const Comp = route.Wrap as any
        const wrapped = <Layout><Comp/></Layout>
        const html = await render(wrapped, { request, ...route.context })
        return new Response(html, { headers: { "Content-Type": 'text/html' }, status: 200 });
      }
      return new Response('error', { headers: { "Content-Type": 'text/html' }, status: 404 });
    })
  }
  component <C extends GenericProps> (Component: GenericComponent<C>, options: ComponentOptions<C>): ComponentWithMethods<C>
  component <C extends GenericProps> (path: string, Component: GenericComponent<C>, propsToUrlOrOptions?: PropsToUrl<C> | ComponentOptions<C>): ComponentWithMethods<C>
  component <C extends GenericProps> (pathOrComponent: GenericComponent<C> | string, ComponentOrOptions: ComponentOptions<C> | GenericComponent<C>, propsToUrlOrOptions?: PropsToUrl<C> | ComponentOptions<C>): ComponentWithMethods<C> {
    const path = typeof pathOrComponent === 'string' ? pathOrComponent : typeof ComponentOrOptions === 'object' ? ComponentOrOptions.path : null
    if (!path) throw new Error('No path provided to component');
    
    const Component = typeof pathOrComponent === 'function' ? pathOrComponent : typeof ComponentOrOptions === 'function' ? ComponentOrOptions : null
    if (!Component) throw new Error('No component provided');

    const _propsToUrl = (typeof ComponentOrOptions === 'object') ? ComponentOrOptions.propsToUrl : typeof propsToUrlOrOptions === 'function' ? propsToUrlOrOptions : undefined
    
    const wrapper = (typeof ComponentOrOptions === 'object') ? ComponentOrOptions.Wrapper : (typeof propsToUrlOrOptions === 'object') ? propsToUrlOrOptions.Wrapper : this.wrapper

    const instance = new ComponentMethods<C>(path, Component, _propsToUrl, wrapper)
    this.routes.push(instance)
    return Object.assign(instance.Wrap as GC<C>, instance)
  }
  static main () {
    return new HTMXComponents('unknown')
  }
  context (context = {}): Routes {
    this.routes.push(this.registryPage(context))
    return this.routes.map(route => {
      if (route instanceof SimpleRoute) return route
      return route.clone(context)
    })
  }
}

const { component, serve } = HTMXComponents.main()
export { component, serve }