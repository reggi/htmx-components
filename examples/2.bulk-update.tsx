// deno-lint-ignore-file require-await no-explicit-any
import { HTMX, HTMXComponents, Fragment } from "../mod.tsx"
import { DummyDb } from "./dummydb.ts"

const { component, partial, serve, routes } = new HTMXComponents('@reggi/example-bulk-update')

const db = new DummyDb([
  { firstName: 'Thomas', lastName: 'Reggi', email: 'thomas@reggi.com', active: true },
  { firstName: 'Rick', lastName: 'Dekkard', email: 'rick@br.com', active: true },
  { firstName: 'Joe', lastName: 'Smith', email: 'joe@smith.org', active: true },
  { firstName: 'Angie', lastName: 'MacDowell', email: 'rick@br.com', active: true },
  { firstName: 'Fuqua', lastName: 'Tarkenton', email: 'fuqua@tarkenton.org', active: false },
]);

const updateActive = async (req: Request, active: boolean) => {
  if (req.method === 'PUT') {
    (await req.formData()).getAll('ids').forEach((id) => db.setValue(id, 'active', active))
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
  const people = await db.all()
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

export const nav = (
  <Fragment>
    <h1>Bulk Update Examples</h1>
    <ul>
      <li><People.anchor.href boost identifier='2'>People</People.anchor.href></li>
    </ul>
  </Fragment>
)

if (!Deno.env.get('NO_SERVE')) {
  component('/', () => nav)
  await serve()
}

export { routes }