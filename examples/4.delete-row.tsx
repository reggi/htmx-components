// deno-lint-ignore-file require-await
import { Fragment, HTMX, HTMXComponents, asyncComponent } from "../mod.tsx"

const { component, partial, serve, routes } = new HTMXComponents('@reggi/delete-row')

let inMemoryDb: any = {
  '1': { firstName: 'Thomas', lastName: 'Reggi', email: 'thomas@reggi.com', active: true },
  '2': { firstName: 'Rick', lastName: 'Dekkard', email: 'rick@br.com', active: true },
  '3': { firstName: 'Joe', lastName: 'Smith', email: 'joe@smith.org', active: true },
  '4': { firstName: 'Angie', lastName: 'MacDowell', email: 'rick@br.com', active: true },
  '5': { firstName: 'Fuqua', lastName: 'Tarkenton', email: 'fuqua@tarkenton.org', active: false },
}

const cloneInMemoryDb = {...inMemoryDb}

const queryDatabase = async () => {
  return Object.entries(inMemoryDb).map(([id, user]: any) => ({ id, ...user }))
}

const deleteItem = async (id: string) => {
  delete inMemoryDb[id]
}

const hydrateData = async () => {
  inMemoryDb = {...cloneInMemoryDb}
}

const DeleteRow = partial('/delete-row/:item', async ({ item }: { item: string }) => {
  await deleteItem(item)
  return (
    <Fragment></Fragment>
  )
})

const Entires = asyncComponent(async () => {
  const entries = await queryDatabase()
  return (
    <Fragment>
      {entries.map(entry => (
        <tr>
        <td>{entry.firstName} {entry.lastName}</td>
        <td>{entry.email}</td>
        <td>{entry.active ? 'Active': "Inactive"}</td>
        <td>
          <DeleteRow.button.delete class="btn btn-danger" item={entry.id}>
            Delete 
          </DeleteRow.button.delete>
        </td>
      </tr>
      ))}
    </Fragment>
  )
})

const Hydrate = partial('/hydrate', async () => {
  await hydrateData()
  return (
    <Entires/>
  )
})

export const DeleteRowExample = component('/delete-row-example', async () => {
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

if (!Deno.env.get('NO_SERVE')) {
  await serve()
}

export { routes }