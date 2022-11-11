// deno-lint-ignore-file no-explicit-any

import { JSX, Fragment } from 'preact'
import { HTMXContext } from './component_methods.tsx'

// you need a way to ignore the type error for an async component
export const asyncComponent = (component: (props: any, ctx?: any) => Promise<JSX.Element>): (props: any) => JSX.Element => {
  return component as any
}

export const FormData = asyncComponent(async (props: {children: (data: any) => JSX.Element}, ctx: HTMXContext) => {
  const x = await ctx.request.formData()
  return (
    <Fragment>
      {props.children(Object.fromEntries(x.entries()))}
    </Fragment>
  )
})
