// this is a prototype of a custom import that allows you to have access to the file types from within the transform

import {clientImport} from '../core/client_import.ts'

const a = await clientImport("./web_components/content_warning.ts")
const b = await clientImport("./client_code/multi.ts")

console.log(a.path)
console.log(b.path)
console.log(b.exports.alice('hi'))