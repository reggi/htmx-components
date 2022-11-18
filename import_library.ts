import { metaDir } from "./core/meta_url.ts";
export const basePath = metaDir()

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
