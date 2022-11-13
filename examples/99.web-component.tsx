import { ComponentChild } from "preact";
import { defineWebComponent, HTMXComponents } from "../mod.tsx";

export const ContentWarning = defineWebComponent<{ props: { children: ComponentChild }}>({
  tag: 'content-warning',
  path: './content_warning.ts',
})

const { component, serve, routes } = new HTMXComponents({
  name: '@reggi/web-component',
  webComponents: [ ContentWarning ],
})

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