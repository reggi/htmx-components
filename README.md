# HTMX Components

I think of it as:
1. Async Server Components 
2. HTMX in JSX (Fully typed JSX for all HTMX attributes without the `hx` prefix.)
3. Dynamic routing / nesting / serving (no files / folders)

## "Click To Edit" Example

This example acts as the "rosetta stone" it's a near 1:1 with the first example in the HTMX docs:

* Start the server `deno task click-to-edit`
* Original HTMX code found here: https://htmx.org/examples/click-to-edit/
* Open the code on github https://github.com/reggi/htmx-components/blob/main/examples/1.click-to-edit.tsx
* Open the file locally `code ./examples/1.click-to-edit.tsx`
* Navigate to http://localhost:8000/contacts/1
* Navigate to http://localhost:8000/contacts/1/edit

## Philosophy / Anatomy / Ergonomics

This is an HTMX component:

```tsx
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
```

It's a wrapped component that couples the `URLPattern` route with the markup. This is an essential philosphy of HTMX Components, and complements HTMX well, why? Because HTMX is HTML over the wire, in HTMX the endpoints themselves are "components". Deeply coupling the markup with the route is a no-brainer, this also provides a number of benifits.

Did you know that the JavaScript `string` (like the primative) object has a [method called `link`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/link), like... (`'hello".link()`) which returns a DOM element 🤯. Obviously this is a odd feature for a programming language but not _the_ programmming language of the web. It's long deprecated now but it gives us a glimpse into the fossil record of what was going through the early developers of the webs minds. While I have a love / hate relationship with this `link` method, I'm paying homage to it in this library. Every HTMX Component returns a normal JSX element totally as you'd expect except with two exceptions, they can run async code (like next.js / react 18), they also return extra "function" properties that return other JSX elements. That allows you to target them in specific typesafe ways. For instance you can do `Contact.href`, now this may not be great if there's a param in the url, but for that there's `Contact.getPath({ typesafety! })`, there's also nested JSX elements like `<Contact.anchor.href/>` and `<Contact.form.put/>`, these allow you to target the route of a component in a typesafe way.

---

<details>
<summary>Default Example (more chaotic example)</summary>

* `deno task start`
* http://localhost:8000/nest/bob
* http://localhost:8000/nest/alice/matt
* http://localhost:8000/registry/@reggi/alicebob

# Default Example:

![](./screenshots/J9x_9P1Y.jpg)
![](./screenshots/DR2PrQJK.png)
w
```tsx
import { HTMX, HTMXComponents, serve, Fragment } from "./mod.tsx"

// http://localhost:8000/registry/@reggi/alicebob
const { component, routes, context } = new HTMXComponents('@reggi/alicebob')

const Alice = component('/alice/:name', async ({ name }: { name: string}, ctx) => {
  const _name = await Promise.resolve(name)
  const req = new URL(ctx.request.url)
  const query = req.searchParams.get('meow')
  return (
    <div>
      <div>This is {_name} + {ctx.data.love} {ctx.id} {query}</div>
    </div>
  )
})

const Bob = component('/bob', async (_p, ctx) => {
  const name = await Promise.resolve('bob')
  return (
    <Fragment>
      <HTMX.button get={Alice.getPath(ctx, { name: 'alice' }, { meow: 'meow' })}>Different</HTMX.button>
      <Alice.button.get name={'kettle'} query={{meow: true}}>Alice Button</Alice.button.get>
      <Alice.anchor.href name={'kettle'} useQuery>Alice Link</Alice.anchor.href>
      <Alice.iframe.src name={'kettle'} query={{meow: true}} useQuery>Alice Link</Alice.iframe.src>
      <div>This is {name} {ctx.id}</div>
      <Alice name="alice"/>
    </Fragment>
  )
})

const e = context({
  nestPath: '/nest',
  love: 'lauriel'
})

await serve(e)

// or 
// export default routes // like express routes
```

</details>


