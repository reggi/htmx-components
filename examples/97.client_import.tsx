// this is a prototype of a custom import that allows you to have access to the file types from within the transform

import {clientImport} from '../core/client_import.ts'

const a = await clientImport(import.meta.url, "../examples/web_components/content_warning.ts")
const b = await clientImport(import.meta.url, "../examples/client_code/multi.ts")

console.log(a)
console.log(b)
