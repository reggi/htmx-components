// deno-lint-ignore-file require-await no-explicit-any
import { THIS_ELEMENT, EVENT, JSX, Fragment, HTMX, HTMXComponents } from "../mod.tsx"

const { component, partial, serve, bundleImport, routes } = new HTMXComponents('@reggi/delete-row')

export const EditOne = await bundleImport('./client_code/edit_one.ts')

const inMemoryDb: any = {
  '1': { firstName: 'Thomas', lastName: 'Reggi', email: 'thomas@reggi.com' },
  '2': { firstName: 'Rick', lastName: 'Dekkard', email: 'rick@br.com' }
}

const queryDatabase = async () => {
  return Object.entries(inMemoryDb).map(([id, user]: any) => ({ id, ...user }))
}

const findDatabase = async ({ identifier }: { identifier: string }) => {
  if (identifier === '1') return {...inMemoryDb['1'], id: identifier}
  if (identifier === '2') return {...inMemoryDb['2'], id: identifier}
  throw new Error('not found')
}

const updateDatabase = async ({ identifier }: { identifier: string }, payload: any)=> {
  if (identifier in inMemoryDb) {
    inMemoryDb[identifier] = payload
  }
}

const getOrUpdate = async ({ identifier }: { identifier: string }, request: Request) => {
  if (request.method === 'PUT') {
    const { name, email } = Object.fromEntries((await request.formData()).entries())
    if (typeof name !== 'string') throw new Error('invalid name');
    const [firstName, lastName] = name.split(' ')
    updateDatabase({ identifier }, { firstName, lastName, email })
    return { firstName, lastName, email, id: identifier }
  }
  return await findDatabase({ identifier })
}

export const Table = component('/edit-row', async ({ rows }: { rows: JSX.Element }) => {
  const entries = await queryDatabase()
  return (
    <Fragment>
      <p>This file has a bundled js file loaded in the HEAD on the page, and some client-side js will run from within the click handlers, preventing you from editing 2 things at once.</p>
      <table class="table delete-row-example">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th></th>
          </tr>
        </thead>
        <HTMX.tbody targetClosest="tr" swapOuter>
          {entries.map((row: any) => <DumbRow data={row}/>)}
        </HTMX.tbody>
      </table>
    </Fragment>
  )
})

const DumbRow = ({ data }: { data: any }) => (
  <tr>
    <td>{data.firstName} {data.lastName}</td>
    <td>{data.email}</td>
    <td>
      <EditRow.button.get onclick={EditOne.onClickEdit(THIS_ELEMENT, EVENT)} identifier={data.id}>Edit</EditRow.button.get>
    </td>
  </tr>
)

const Row = partial('/edit-row/contact/:identifier', async ({ identifier }: { identifier: string}, ctx) => {
  const data = await getOrUpdate({ identifier }, ctx.request)
  return <DumbRow data={data}/>
})

const EditRow = partial('/edit-row/contact/:identifier/edit', async ({ identifier }: { identifier: string}, ctx) => {
  const data = await getOrUpdate({ identifier }, ctx.request)
  return (
    <HTMX.tr>
      <td><input name='name' value={`${data.firstName} ${data.lastName}`}/></td>
      <td><input name='email' value={`${data.email}`}/></td>
      <td>
        <HTMX.button onclick={EditOne.onClickCancel(THIS_ELEMENT)} class="btn btn-danger cancelButton" hx-get={`/edit-row/contact/${identifier}`}>
          Cancel
        </HTMX.button>
        <button class="btn btn-danger" hx-put={`/edit-row/contact/${identifier}`} hx-include="closest tr">
          Save
        </button>
      </td>
    </HTMX.tr> 
  )
})

if (!Deno.env.get('NO_SERVE')) {
  await serve()
}

export { routes }
