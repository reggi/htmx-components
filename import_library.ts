
import * as path from "https://deno.land/std/path/mod.ts";
export const basePath = path.dirname(import.meta.url.replace(/^file:\/\//, ''))

export const library = {
  "./client_code/multi.ts": {
    path: `${basePath}/examples/client_code/multi.ts`,
    code: () => import("./examples/client_code/multi.ts")
  },
  "./client_code/edit_one.ts": {
    path: `${basePath}/examples/client_code/edit_one.ts`,
    code: () => import("./examples/client_code/edit_one.ts")
  },
}
