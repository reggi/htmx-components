// deno-lint-ignore-file require-await no-explicit-any
import { HTMX, HTMXComponents, Fragment } from "../mod.tsx"

const { component, partial, serve, routes } = new HTMXComponents('@reggi/example-bulk-update')

let inMemoryDb: any = {
  '1': { firstName: 'Thomas', lastName: 'Reggi', email: 'thomas@reggi.com', active: true },
  '2': { firstName: 'Rick', lastName: 'Dekkard', email: 'rick@br.com', active: true },
  '3': { firstName: 'Joe', lastName: 'Smith', email: 'joe@smith.org', active: true },
  '4': { firstName: 'Angie', lastName: 'MacDowell', email: 'rick@br.com', active: true },
  '5': { firstName: 'Fuqua', lastName: 'Tarkenton', email: 'fuqua@tarkenton.org', active: false },
}

const queryDatabase = async () => {
  return Object.entries({...inMemoryDb}).map(([id, user]: any) => ({ id, ...user }))
}

const updateActive = async (req: Request, active: boolean) => {
  if (req.method === 'PUT') {
    const body = await req.formData()
    const ids = body.getAll('ids')
    ids.forEach((value: any) => {
      const id: string = value
      const v = inMemoryDb
      inMemoryDb = {
        ...v,
        [id]: { ...inMemoryDb[id], active }
      }
    })
  }
}

const Activate = partial('/activate', async (_, ctx) => {
  updateActive(ctx.request, true)
  return <PeopleTableBody></PeopleTableBody>
})

const Deactivate = partial('/deactivate', async (_, ctx) => {
  updateActive(ctx.request, false)
  return <PeopleTableBody></PeopleTableBody>
})

const PeopleTableBody = partial('/people-table-body', async () => {
  const people = await queryDatabase()
  return (
    <Fragment>
      {people.map((person: any) => (
        <tr class="">
          <td><input type='checkbox' name='ids' value={person.id}/></td>
          <td>{person.firstName} {person.lastName}</td>
          <td>{person.email}</td>
          <td>{person.active ? 'Active' : 'Inactive'}</td>
        </tr>
      ))}
    </Fragment>
  )
})

export const People = component('/people', async () => {
  return (
    <Fragment>
      <form id="checked-contacts">
        <table>
          <thead>
            <tr>
              <th></th>
              <th>Name</th>
              <th>Email</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody id="tbody">
            <PeopleTableBody/>
          </tbody>
        </table>
      </form>
      <HTMX.div include="#checked-contacts" target="#tbody" swapInner>
        <Activate.button.put class="btn">Activate</Activate.button.put>
        <Deactivate.button.put class="btn">Deactivate</Deactivate.button.put>
      </HTMX.div>
    </Fragment>
  )
})

if (!Deno.env.get('NO_SERVE')) {
  await serve()
}

export { routes }