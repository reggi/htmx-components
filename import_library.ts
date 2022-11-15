export const basePath = Deno.cwd()

export const library = {
  "./client_code/multi.ts": {
    path: `${basePath}/examples/client_code/multi.ts`,
    code: () => import("./examples/client_code/multi.ts")
  },
}
