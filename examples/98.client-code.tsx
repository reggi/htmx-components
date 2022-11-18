import { Fragment } from "preact";
import { HTMX, HTMXComponents } from "../mod.tsx";

const { component, serve, routes, clientImport } = new HTMXComponents('@reggi/client-code')

const multi = await clientImport('./client_code/multi.ts')

export const OnClick = component('/client-code-on-click', () => {
  return (
    <Fragment>
      <p>This demo will fire an `import()` of a client-side js file, and execute a exported function on click.</p>
      <HTMX.button onClick={multi.alice('hello')}>Alice Says "hello"</HTMX.button><br/><br/>
      <HTMX.button onClick={multi.bob('welcome')}>Bob Says "welcome"</HTMX.button>
    </Fragment>
  )
})

if (!Deno.env.get('NO_SERVE')) {
  await serve()
}

export { routes }