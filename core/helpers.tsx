// deno-lint-ignore-file no-explicit-any

import { JSX, Fragment } from 'preact'
import { asyncComponent } from '../mod.tsx'
import { HTMXContext } from './component_methods.tsx'

export const FormData = asyncComponent(async (props: {children: (data: any) => JSX.Element}, ctx: HTMXContext) => {
  const x = await ctx.request.formData()
  return (
    <Fragment>
      {props.children(Object.fromEntries(x.entries()))}
    </Fragment>
  )
})
