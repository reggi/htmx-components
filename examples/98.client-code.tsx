import { Fragment } from "preact";
import { HTMXComponents } from "../mod.tsx";

const { component, serve, routes, clientCode } = new HTMXComponents('@reggi/web-component')

export const ClientCodeExample = clientCode(
  new URL('./client_code/example.ts', import.meta.url).href
)

export const OnLoad = component('/client-code-on-load', () => {
  return (
    <div>
      hi! check the logs client code should have ran on load!
      <ClientCodeExample/>
    </div>
  )
})

export const OnClick = component('/client-code-on-click', () => {
  return (
    <Fragment>
      <ClientCodeExample.scriptModule/>

      <ClientCodeExample.div.onClick>
        fancy clicker
      </ClientCodeExample.div.onClick>

      <br/><br/><br/><br/>

      {/* // deno-lint-ignore ban-ts-comment
      // @ts-ignore */}
      <div onclick={ClientCodeExample.run()}>
        hi! click me and it should load client code
      </div>
    </Fragment>
  )
})

if (!Deno.env.get('NO_SERVE')) {
  await serve()
}

export { routes }