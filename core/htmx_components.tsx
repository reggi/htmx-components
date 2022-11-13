// deno-lint-ignore-file no-explicit-any
import { serve as denoServe } from "$std/http/server.ts";
import { ComponentMethods, GC, GenericComponent, GenericProps } from "./component_methods.tsx"
import { Layout } from './layout.tsx'
import render from 'preact-async-render-to-string'
import { PropsToUrl } from './method_convience.tsx';
import { ComponentChild, ComponentChildren, JSX } from 'preact'
import { isWebComponent, WebComponent } from "./web_component.tsx";
import { Bundler } from "../esbuild/bundle.ts";

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

class ComponentMethodsRaw<C extends GenericProps> extends ComponentMethods<C> {}

class SimpleRoute {
  constructor (
    public urlPattern: URLPattern,
    public response: Response,
    public options: { scriptTag?: boolean } = {}
  ) {}
}

type Routes = (ComponentMethods<any> | SimpleRoute | WebComponent)[]

interface Options {
  name: string,
  wrapper?: WrapperType,
  layout?: (props: { children: ComponentChild }) => JSX.Element,
  webComponents?: WebComponent[],
}

export class HTMXComponents {
  routes: Routes = []
  constructor (
    public _first: string | Options,
    public wrapper = undefined
  ) {
    this.component = this.component.bind(this)
    this.partial = this.partial.bind(this)
    this.serve = this.serve.bind(this)
    this.context = this.context.bind(this)
    this.registryPage = this.registryPage.bind(this)
    this.routes = [...this.routes, ...this.webComponents]
  }

  get name () {
    if (typeof this._first == 'string') return this._first
    return this._first.name
  }

  get webComponents () {
    if (typeof this._first == 'string') return []
    return this._first.webComponents || []
  }

  registryPage (publicContext: any) {
    const req = new URLPattern({ pathname: `/registry/${this.name}` });
    const res = Response.json(publicContext)
    return new SimpleRoute(req, res)
  }

  webComponentsFroRoutes (routes: Routes): WebComponent[] {
    return routes.filter(v => isWebComponent(v)) as any
  }

  async serve (routes: Routes = []) {
    let b: Bundler | undefined = undefined

    const allRoutes = [...this.routes, ...routes]
    const webComponents = this.webComponentsFroRoutes(allRoutes)

    if (webComponents.length) {
      b = new Bundler([{ id: 'content_warning', url: new URL('../examples/web_components/content_warning.ts', import.meta.url).href}])
      await b.bundle()
    }

    return denoServe(async (request: Request) => {
      const fourOhFour = new Response('error', { headers: { "Content-Type": 'text/html' }, status: 404 });
      const route = allRoutes.find(route => route.urlPattern.exec(request.url))

      if (route instanceof SimpleRoute) {
        return route.response
      }

      if (isWebComponent(route)) {
        if (!b) return fourOhFour
        const data = await b.get(route.externalId)
        return new Response(data, { headers: { "Content-Type": 'text/javascript' }, status: 200 });
      }

      if (route) {
        const results = route.urlPattern.exec(request.url)
        const params = results?.pathname.groups
        const Comp = route.Wrap as any
        const scripts = webComponents.map(c => c.script)
        const wrapped = route instanceof ComponentMethodsRaw ? <Comp {...params}/> : <Layout head={scripts}><Comp {...params}/></Layout>
        const html = await render(wrapped, { request, ...route.context })
        return new Response(html, { headers: { "Content-Type": 'text/html' }, status: 200 });
      }
      
      return fourOhFour
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

  partial <C extends GenericProps> (Component: GenericComponent<C>, options: ComponentOptions<C>): ComponentWithMethods<C>
  partial <C extends GenericProps> (path: string, Component: GenericComponent<C>, propsToUrlOrOptions?: PropsToUrl<C> | ComponentOptions<C>): ComponentWithMethods<C>
  partial <C extends GenericProps> (pathOrComponent: GenericComponent<C> | string, ComponentOrOptions: ComponentOptions<C> | GenericComponent<C>, propsToUrlOrOptions?: PropsToUrl<C> | ComponentOptions<C>): ComponentWithMethods<C> {
    const path = typeof pathOrComponent === 'string' ? pathOrComponent : typeof ComponentOrOptions === 'object' ? ComponentOrOptions.path : null
    if (!path) throw new Error('No path provided to component');
    
    const Component = typeof pathOrComponent === 'function' ? pathOrComponent : typeof ComponentOrOptions === 'function' ? ComponentOrOptions : null
    if (!Component) throw new Error('No component provided');

    const _propsToUrl = (typeof ComponentOrOptions === 'object') ? ComponentOrOptions.propsToUrl : typeof propsToUrlOrOptions === 'function' ? propsToUrlOrOptions : undefined
    
    const wrapper = (typeof ComponentOrOptions === 'object') ? ComponentOrOptions.Wrapper : (typeof propsToUrlOrOptions === 'object') ? propsToUrlOrOptions.Wrapper : this.wrapper

    const instance = new ComponentMethodsRaw<C>(path, Component, _propsToUrl, wrapper)
    this.routes.push(instance)
    return Object.assign(instance.Wrap as GC<C>, instance)
  }

  static main () {
    return new HTMXComponents('unknown')
  }
  context (context = {}): Routes {
    // const webComponents = await this.webComponentsRoutes()
    // this.routes = [...this.routes, ...webComponents];
    return this.routes.map(route => {
      if (isWebComponent(route)) return route
      if (route instanceof SimpleRoute) return route
      return route.clone(context)
    })
  }
}

const { component, serve } = HTMXComponents.main()
export { component, serve }