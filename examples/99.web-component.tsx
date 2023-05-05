import { ComponentChild } from "preact";
import { Fragment, HTMXComponents } from "../mod.tsx";

const { component, serve, routes, webComponent } = new HTMXComponents('@reggi/web-component')

export const ContentWarning = webComponent<{ children: ComponentChild }>('./web_components/content_warning.ts')

export const WebComponentExample = component('/web-component', () => {
  return (
    <ContentWarning>
      <img src="https://pbs.twimg.com/media/FblYTJZXwAAStJ6?format=jpg&name=small" alt="Veggie Sandwich" width='300'/>
    </ContentWarning>
  )
})

export const nav = (
  <Fragment>
    <h1>Web Component</h1>
    <ul>
      <li><WebComponentExample.anchor.href boost>Web Component</WebComponentExample.anchor.href></li>
    </ul>
  </Fragment>
)

if (!Deno.env.get('NO_SERVE')) {
  component('/', () => nav)
  await serve()
}

export { routes }