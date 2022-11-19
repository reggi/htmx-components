// deno-lint-ignore-file no-explicit-any
import { THIS_ELEMENT, EVENT, JSX, Fragment, HTMX, HTMXComponents } from "../mod.tsx"
import { DummyDb } from "./dummydb.ts"
import { stringFormData } from "./request_helper.ts"

const { component, partial, serve, bundleImport, routes } = new HTMXComponents('@reggi/delete-row')
export const EditOne = await bundleImport('./client_code/edit_one.ts')

const db = new DummyDb([
  { firstName: 'Thomas', lastName: 'Reggi', email: 'thomas@reggi.com' },
  { firstName: 'Rick', lastName: 'Dekkard', email: 'rick@br.com' }
])

const formEntriesData = async (id: string, request: Request) => {
  if (request.method !== 'PUT') return;
  const { firstName, lastName, email } = await stringFormData(request)
  return { firstName, lastName, email, id: parseInt(id) }
}

export const Table = component('/edit-row', async ({ rows }: { rows: JSX.Element }) => {
  const entries = await db.all()
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
  const data = db.updateOrFind(identifier, await formEntriesData(identifier, ctx.request))
  return <DumbRow data={data}/>
})

const EditRow = partial('/edit-row/contact/:identifier/edit', async ({ identifier }: { identifier: string}, ctx) => {
  const data = db.updateOrFind(identifier, await formEntriesData(identifier, ctx.request))
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