
export const library = {
  "./client_code/multi.ts": {
    path: `./examples/client_code/multi.ts`,
    code: () => import("./examples/client_code/multi.ts")
  },
  "./client_code/edit_one.ts": {
    path: `./examples/client_code/edit_one.ts`,
    code: () => import("./examples/client_code/edit_one.ts")
  },
}
