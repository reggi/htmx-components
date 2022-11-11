// deno-lint-ignore-file require-await
import { serve, Fragment, HTMXComponents } from '../mod.tsx'
import { routes as clickToEdit, Contact, Edit } from './1.click-to-edit.tsx';
import { routes as bulkUpdate, People } from './2.bulk-update.tsx';

const { component, routes } = new HTMXComponents('@reggi/examples')

const Home = component('/', async () => (
  <Fragment>
    <h1>Click to Edit Examples</h1>
    <ul>
      <li><Contact.anchor.href boost identifier='1'>View Contact 1</Contact.anchor.href></li>
      <li><Contact.anchor.href boost identifier='2'>View Contact 2</Contact.anchor.href></li>
      <li><Edit.anchor.href boost identifier='1'>Edit Contact 1</Edit.anchor.href></li>
      <li><Edit.anchor.href boost identifier='2'>Edit Contact 2</Edit.anchor.href></li>
    </ul>
    <h1>Bulk Update Examples</h1>
    <ul>
      <li><People.anchor.href boost identifier='2'>People</People.anchor.href></li>
    </ul>
  </Fragment>
))

await serve([
  ...routes,
  ...clickToEdit,
  ...bulkUpdate
])