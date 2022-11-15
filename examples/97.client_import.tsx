// this is a prototype of a custom import that allows you to have access to the file types from within the transform

import {clientImport} from '../core/client_import.ts'

const a = clientImport("../examples/web_components/content_warning.ts")
const b = clientImport("../examples/client_code/multi.ts")

console.log(a.path)
console.log(b.path)
console.log(b.alice('hello'))