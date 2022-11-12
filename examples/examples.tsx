// deno-lint-ignore-file require-await
import { serve, Fragment, HTMXComponents } from '../mod.tsx'
import { routes as clickToEdit, Contact, Edit } from './1.click-to-edit.tsx';
import { routes as bulkUpdate, People } from './2.bulk-update.tsx';
import { routes as clickToLoad, ClickToLoad } from './3.click-to-load.tsx';
import { routes as deleteRow, DeleteRowExample } from './4.delete-row.tsx';

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
    <h1>Click to Load Example</h1>
    <ul>
      <li><ClickToLoad.anchor.href boost>Click to Load Example</ClickToLoad.anchor.href></li>
    </ul>
    <h1>Delete Row</h1>
    <ul>
      <li><DeleteRowExample.anchor.href boost>Delete Row Example</DeleteRowExample.anchor.href></li>
    </ul>
  </Fragment>
))

await serve([
  ...routes,
  ...clickToEdit,
  ...bulkUpdate,
  ...clickToLoad,
  ...deleteRow
])