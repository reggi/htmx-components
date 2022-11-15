import { Fragment } from "preact";
import { HTMX, HTMXComponents } from "../mod.tsx";

const { component, serve, routes, clientImport } = new HTMXComponents('@reggi/client-code')

const multi = await clientImport('./client_code/multi.ts')

export const OnClick = component('/client-code-on-click', () => {
  return (
    <Fragment>
      <HTMX.div onClick={multi.alice('hello')}>Do something</HTMX.div>
      <HTMX.div onClick={multi.bob('welcome')}>Do something else</HTMX.div>
    </Fragment>
  )
})

if (!Deno.env.get('NO_SERVE')) {
  await serve()
}

export { routes }