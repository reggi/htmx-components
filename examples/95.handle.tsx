import { Fragment, HTMX, HTMXComponents } from "../mod.tsx";

const { component, serve, routes, clientImport, endpoint} = new HTMXComponents('@reggi/client-code')

const multi = await clientImport('./client_code/multi.ts')

export const data = endpoint('/data', () => {
  return Response.json({ hello: true })
})

if (!Deno.env.get('NO_SERVE')) {
  await serve()
}

export { routes }