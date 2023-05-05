// deno-lint-ignore-file require-await
import { serve, Fragment, HTMXComponents } from '../mod.tsx'
import * as clickToEdit from './1.click-to-edit.tsx';
import * as bulkUpdate from './2.bulk-update.tsx';
import * as clickToLoad from './3.click-to-load.tsx';
import * as deleteRow from './4.delete-row.tsx';
import * as editRowRoutes from './5.edit-row.tsx'
import * as clientImport from './98.client-code.tsx';
import * as webComponent from './99.web-component.tsx';

const { component, routes } = new HTMXComponents('@reggi/examples')

component('/', async () => (
  <Fragment>
    {clickToEdit.nav}
    {bulkUpdate.nav}
    {clickToLoad.nav}
    {deleteRow.nav}
    {webComponent.nav}
    {clientImport.nav}
    {editRowRoutes.nav}
  </Fragment>
))

await serve([
  ...routes,
  ...clickToEdit.routes,
  ...bulkUpdate.routes,
  ...clickToLoad.routes,
  ...deleteRow.routes,
  ...webComponent.routes,
  ...clientImport.routes,
  ...editRowRoutes.routes
])