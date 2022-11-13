// -- esbuild --
// @deno-types="https://deno.land/x/esbuild@v0.14.51/mod.d.ts"
import * as esbuildWasm from "https://deno.land/x/esbuild@v0.14.51/wasm.js";
import * as esbuildNative from "https://deno.land/x/esbuild@v0.14.51/mod.js";
// @ts-ignore trust me
const esbuild: typeof esbuildWasm = Deno.run === undefined
  ? esbuildWasm
  : esbuildNative;
export { esbuild, esbuildWasm as esbuildTypes };
export { denoPlugin } from "https://deno.land/x/esbuild_deno_loader@0.5.2/mod.ts";


export { toFileUrl } from "https://deno.land/std@0.150.0/path/mod.ts";