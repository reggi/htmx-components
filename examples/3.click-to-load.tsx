// deno-lint-ignore-file require-await
import { Fragment, HTMXComponents } from "../mod.tsx"
import { nanoid } from 'nanoid'

const { component, partial, serve, routes } = new HTMXComponents('@reggi/click-to-load')

const getContacts = async (page: number) => {
  return [
    { name: 'Agent Smith', email: `void${page}${0}@null.org`, id: nanoid(5) },
    { name: 'Agent Smith', email: `void${page}${1}@null.org`, id: nanoid(5) },
    { name: 'Agent Smith', email: `void${page}${2}@null.org`, id: nanoid(5) },
    { name: 'Agent Smith', email: `void${page}${3}@null.org`, id: nanoid(5) },
    { name: 'Agent Smith', email: `void${page}${4}@null.org`, id: nanoid(5) },
    { name: 'Agent Smith', email: `void${page}${5}@null.org`, id: nanoid(5) },
    { name: 'Agent Smith', email: `void${page}${6}@null.org`, id: nanoid(5) },
    { name: 'Agent Smith', email: `void${page}${7}@null.org`, id: nanoid(5) },
    { name: 'Agent Smith', email: `void${page}${8}@null.org`, id: nanoid(5) },
    { name: 'Agent Smith', email: `void${page}${9}@null.org`, id: nanoid(5) },
  ]
}

const Rows = partial('/contacts-rows', async (_, ctx) => {
  const page = parseInt(new URL(ctx.request.url).searchParams.get('page') || '0')
  const contacts = await getContacts(page)
  return (
    <Fragment>
      {contacts.map((contact) => (
        <tr>
          <td>{contact.name}</td>
          <td>{contact.email}</td>
          <td>{contact.id}</td>
        </tr>
      ))}
      <tr id="replaceMe">
        <td colSpan={3}>
          <Rows.button.get query={{page: page + 1}} target="#replaceMe" swapOuterHTML>
              Load More Agents... <img class="htmx-indicator" src="https://htmx.org/img/bars.svg"/>
          </Rows.button.get>
        </td>
      </tr>
    </Fragment>
  )
})

export const ClickToLoad = component('/click-to-load', (_props, ctx) => {
  const page = parseInt(new URL(ctx.request.url).searchParams.get('page') || '0')
  return (
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>ID</th>
        </tr>
      </thead>
      <Rows page={page} />
    </table>
  )  
})

export const nav = (
  <Fragment>
    <h1>Click to Load Example</h1>
    <ul>
      <li><ClickToLoad.anchor.href boost>Click to Load Example</ClickToLoad.anchor.href></li>
    </ul>
  </Fragment>
)

if (!Deno.env.get('NO_SERVE')) {
  component('/', () => nav)
  await serve()
}

export { routes }