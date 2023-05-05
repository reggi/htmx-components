import { Fragment, HTMX, HTMXComponents, asyncComponent } from "../mod.tsx"
import { DummyDb } from './dummydb.ts'

const { component, partial, serve, routes } = new HTMXComponents('@reggi/delete-row')

const db = new DummyDb([
  { firstName: 'Thomas', lastName: 'Reggi', email: 'thomas@reggi.com', active: true },
  { firstName: 'Rick', lastName: 'Dekkard', email: 'rick@br.com', active: true },
  { firstName: 'Joe', lastName: 'Smith', email: 'joe@smith.org', active: true },
  { firstName: 'Angie', lastName: 'MacDowell', email: 'rick@br.com', active: true },
  { firstName: 'Fuqua', lastName: 'Tarkenton', email: 'fuqua@tarkenton.org', active: false },
])

const DeleteRow = partial('/delete-row/:item', async ({ item }: { item: string }) => {
  await db.remove(item)
  return (
    <Fragment></Fragment>
  )
})

const Entires = asyncComponent(async () => {
  const entries = await db.all()
  return (
    <Fragment>
      {entries.map(entry => (
        <tr>
        <td>{entry.firstName} {entry.lastName}</td>
        <td>{entry.email}</td>
        <td>{entry.active ? 'Active': "Inactive"}</td>
        <td>
          <DeleteRow.button.delete class="btn btn-danger" item={entry.id.toString()}>
            Delete 
          </DeleteRow.button.delete>
        </td>
      </tr>
      ))}
    </Fragment>
  )
})

const Hydrate = partial('/hydrate', async () => {
  await db.reset()
  return (
    <Entires/>
  )
})

export const DeleteRowExample = component('/delete-row-example', () => {
  return (
    <Fragment>
      <style>{`
        tr.htmx-swapping td {
          opacity: 0;
          transition: opacity 1s ease-out;
        }
      `}</style>
      <table class="table delete-row-example">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <HTMX.tbody confirm="Are you sure?" targetClosest="tr" swapOuter swapTiming={1000}>
          <Entires/>
        </HTMX.tbody>
      </table>
      <Hydrate.button.get target="tbody">Hydrate Data</Hydrate.button.get>
    </Fragment>
  )
})

export const nav = (
  <Fragment>
    <h1>Delete Row</h1>
    <ul>
      <li><DeleteRowExample.anchor.href boost>Delete Row Example</DeleteRowExample.anchor.href></li>
    </ul>
  </Fragment>
)

if (!Deno.env.get('NO_SERVE')) {
  component('/', () => nav)
  await serve()
}

export { routes }