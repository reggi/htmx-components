import { BuildOptions } from "https://deno.land/x/esbuild@v0.14.51/mod.js";
export const BUILD_ID = Deno.env.get("DENO_DEPLOYMENT_ID") || crypto.randomUUID();
import { denoPlugin, esbuild, toFileUrl } from "./bundle_deps.ts";

export interface JSXConfig {
  jsx: "react" | "react-jsx";
  jsxImportSource?: string;
}

let esbuildInitialized: boolean | Promise<void> = false;
async function ensureEsbuildInitialized() {
  if (esbuildInitialized === false) {
    if (Deno.run === undefined) {
      const wasmURL = new URL("./esbuild_v0.14.51.wasm", import.meta.url).href;
      esbuildInitialized = fetch(wasmURL).then(async (r) => {
        const resp = new Response(r.body, {
          headers: { "Content-Type": "application/wasm" },
        });
        const wasmModule = await WebAssembly.compileStreaming(resp);
        await esbuild.initialize({
          wasmModule,
          worker: false,
        });
      });
    } else {
      esbuild.initialize({});
    }
    await esbuildInitialized;
    esbuildInitialized = true;
  } else if (esbuildInitialized instanceof Promise) {
    await esbuildInitialized;
  }
}

const JSX_RUNTIME_MODE = {
  "react": "transform",
  "react-jsx": "automatic",
} as const;

export const getEntryId = (entry: { id: string, url: string}) => {
  return `entry-${entry.id}`
}

export class Bundler {
  #importMapURL: URL;
  #jsxConfig: JSXConfig;
  #cache: Map<string, Uint8Array> | Promise<void> | undefined = undefined;
  #dev: boolean;

  constructor(
    public entries: { id: string, url: string }[],
    importMapURL: URL = new URL("../import_map.json", import.meta.url),
    jsxConfig: JSXConfig = { jsx: "react" },
    dev: boolean = false,
  ) {
    this.#importMapURL = importMapURL;
    this.#jsxConfig = jsxConfig;
    this.#dev = dev;
  }

  async bundle() {
    const entryPoints: Record<string, string> = {
    };

    for (const entry of this.entries) {
      entryPoints[getEntryId(entry)] = entry.url;
    }

    const absWorkingDir = Deno.cwd();
    await ensureEsbuildInitialized();
    // In dev-mode we skip identifier minification to be able to show proper
    // component names in Preact DevTools instead of single characters.
    const minifyOptions: Partial<BuildOptions> = this.#dev
      ? { minifyIdentifiers: false, minifySyntax: true, minifyWhitespace: true }
      : { minify: true };
    const bundle = await esbuild.build({
      bundle: true,
      define: { __FRSH_BUILD_ID: `"${BUILD_ID}"` },
      entryPoints,
      format: "esm",
      metafile: true,
      ...minifyOptions,
      outdir: ".",
      // This is requried to ensure the format of the outputFiles path is the same
      // between windows and linux
      absWorkingDir,
      outfile: "",
      platform: "neutral",
      plugins: [denoPlugin({ importMapURL: this.#importMapURL })],
      sourcemap: this.#dev ? "linked" : false,
      splitting: true,
      target: ["chrome99", "firefox99", "safari15"],
      treeShaking: true,
      write: false,
      jsx: JSX_RUNTIME_MODE[this.#jsxConfig.jsx],
      jsxImportSource: this.#jsxConfig.jsxImportSource,
    });
    // const metafileOutputs = bundle.metafile!.outputs;

    // for (const path in metafileOutputs) {
    //   const meta = metafileOutputs[path];
    //   const imports = meta.imports
    //     .filter(({ kind }) => kind === "import-statement")
    //     .map(({ path }) => `/${path}`);
    //   this.#preloads.set(`/${path}`, imports);
    // }

    const cache = new Map<string, Uint8Array>();
    const absDirUrlLength = toFileUrl(absWorkingDir).href.length;
    for (const file of bundle.outputFiles) {
      cache.set(
        toFileUrl(file.path).href.substring(absDirUrlLength),
        file.contents,
      );
    }
    this.#cache = cache;

    return;
  }

  async cache(): Promise<Map<string, Uint8Array>> {
    if (this.#cache === undefined) {
      this.#cache = this.bundle();
    }
    if (this.#cache instanceof Promise) {
      await this.#cache;
    }
    return this.#cache as Map<string, Uint8Array>;
  }

  async get(path: string): Promise<Uint8Array | null> {
    const cache = await this.cache();
    return cache.get(path) ?? null;
  }

  // getPreloads(path: string): string[] {
  //   return this.#preloads.get(path) ?? [];
  // }
}


// import { Bundler } from "./bundle.ts";

// const b = new Bundler([{ id: 'content_warning', url: new URL('../examples/web_components/content_warning.ts', import.meta.url).href}])

// await b.bundle()

// const v = await b.get('/entry-content_warning.js')

// console.log(v)