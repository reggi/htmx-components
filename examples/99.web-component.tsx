import { ComponentChild } from "preact";
import { HTMXComponents } from "../mod.tsx";

const { component, serve, routes, webComponent } = new HTMXComponents('@reggi/web-component')

export const ContentWarning = webComponent<{ children: ComponentChild }>('./web_components/content_warning.ts')

export const WebComponentExample = component('/web-component', () => {
  return (
    <ContentWarning>
      <img src="https://pbs.twimg.com/media/FblYTJZXwAAStJ6?format=jpg&name=small" alt="Veggie Sandwich" width='300'/>
    </ContentWarning>
  )
})

if (!Deno.env.get('NO_SERVE')) {
  await serve()
}

export { routes }