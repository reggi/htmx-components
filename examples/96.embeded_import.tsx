import { embededImport, IMPORT_PATH } from "../core/embeded_import.ts";

const example = await embededImport(import.meta.url, "./client_code/multi.ts")

console.log(example.alice)
// demonstrates that the import has an extra embed string for the absolute path of the module
console.log(example[IMPORT_PATH])