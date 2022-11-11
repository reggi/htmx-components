// deno-lint-ignore-file require-await no-explicit-any

import { HTMX, HTMXComponents, Fragment } from "../mod.tsx"

const { component, serve } = new HTMXComponents('@reggi/example-click-to-edit')

const inMemoryDb: any = {
  '1': { firstName: 'Thomas', lastName: 'Reggi', email: 'thomas@reggi.com' },
  '2': { firstName: 'Rick', lastName: 'Dekkard', email: 'rick@br.com' }
}

const findDatabase = async ({ identifier }: { identifier: string }) => {
  if (identifier === '1') return inMemoryDb['1']
  if (identifier === '2') return inMemoryDb['2']
  throw new Error('not found')
}

const updateDatabase = async ({ identifier }: { identifier: string }, payload: any)=> {
  if (identifier in inMemoryDb) {
    inMemoryDb[identifier] = payload
  }
}

const getOrUpdate = async ({ identifier }: { identifier: string }, request: Request) => {
  if (request.method === 'PUT') {
    const { firstName, lastName, email } = Object.fromEntries((await request.formData()).entries())
    updateDatabase({ identifier }, { firstName, lastName, email })
    return { firstName, lastName, email }
  }
  return await findDatabase({ identifier })
}

const Contact = component('/contacts/:identifier', async ({ identifier }: { identifier: string }, ctx) => {
  const { firstName, lastName, email } = await getOrUpdate({ identifier }, ctx.request)
  return (
    <HTMX.div targetThis swapOuter>
        <div><label>First Name</label>: {firstName} </div>
        <div><label>Last Name</label>: {lastName} </div>
        <div><label>Email</label>: {email} </div>
        <Edit.button.get identifier={identifier} pushUrl class="btn btn-primary">
        Click To Edit
        </Edit.button.get>
    </HTMX.div>
  )
})

const Edit = component('/contacts/:identifier/edit', async ({ identifier }: { identifier: string }) => {
  const { firstName, lastName, email } = await findDatabase({ identifier })
  return (
    <Contact.form.put identifier={identifier} pushUrl targetThis swapOuter>
      <div>
        <label>First Name</label>
        <input type="text" name="firstName" value={firstName}/>
      </div>
      <div class="form-group">
        <label>Last Name</label>
        <input type="text" name="lastName" value={lastName}/>
      </div>
      <div class="form-group">
        <label>Email Address</label>
        <input type="email" name="email" value={email}/>
      </div>
      <button class="btn">Submit</button>
      <Contact.button.get identifier={identifier} pushUrl class='btn'>Cancel</Contact.button.get>
    </Contact.form.put> 
  )
})


await serve()