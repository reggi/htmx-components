import { Fragment, HTMX, HTMXComponents } from "../mod.tsx"
import { DummyDb } from "./dummydb.ts"
import { stringFormData } from "./request_helper.ts"

const { component, serve, routes } = new HTMXComponents('@reggi/example-click-to-edit')

const db = new DummyDb([
  { firstName: 'Thomas', lastName: 'Reggi', email: 'thomas@reggi.com' },
  { firstName: 'Rick', lastName: 'Dekkard', email: 'rick@br.com' }
]);

const formEntriesData = async (id: string, request: Request) => {
  if (request.method !== 'PUT') return;
  const { firstName, lastName, email } = await stringFormData(request)
  return { firstName, lastName, email, id: parseInt(id) }
}

export const Contact = component('/contacts/:identifier', async ({ identifier }: { identifier: string }, ctx) => {
  const data = await db.updateOrFind(identifier, await formEntriesData(identifier, ctx.request))
  return (
    <HTMX.div targetThis swapOuter>
      <div><label>First Name</label>: {data.firstName} </div>
      <div><label>Last Name</label>: {data.lastName} </div>
      <div><label>Email</label>: {data.email} </div>
      <Edit.button.get identifier={data.id.toString()} pushUrl class="btn btn-primary">
        Click To Edit
      </Edit.button.get>
    </HTMX.div>
  )
})

export const Edit = component('/contacts/:identifier/edit', async ({ identifier }: { identifier: string }) => {
  const data = await db.find(identifier)
  return (
    <Contact.form.put identifier={data.id.toString()} pushUrl targetThis swapOuter>
      <div>
        <label>First Name</label>
        <input type="text" name="firstName" value={data.firstName}/>
      </div>
      <div class="form-group">
        <label>Last Name</label>
        <input type="text" name="lastName" value={data.lastName}/>
      </div>
      <div class="form-group">
        <label>Email Address</label>
        <input type="email" name="email" value={data.email}/>
      </div>
      <button class="btn">Submit</button>
      <Contact.button.get identifier={data.id.toString()} pushUrl class='btn'>Cancel</Contact.button.get>
    </Contact.form.put> 
  )
})

export const nav = (
  <Fragment>
    <h1>Click to Edit Examples</h1>
    <ul>
      <li><Contact.anchor.href boost identifier='1'>View Contact 1</Contact.anchor.href></li>
      <li><Contact.anchor.href boost identifier='2'>View Contact 2</Contact.anchor.href></li>
      <li><Edit.anchor.href boost identifier='1'>Edit Contact 1</Edit.anchor.href></li>
      <li><Edit.anchor.href boost identifier='2'>Edit Contact 2</Edit.anchor.href></li>
    </ul>
  </Fragment>
)

if (!Deno.env.get('NO_SERVE')) {
  component('/', () => nav)
  await serve()
}

export { routes }