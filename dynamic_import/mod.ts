import { removeFilePrefix } from '../core/meta_url.ts'
import {
	esbuildNative,
	esbuildWASM,
	dirname,
	toFileUrl,
	DenoConfigurationFile,
	ErrorStackParser,
	resolveModuleSpecifier,
	denoPlugin,
	stripShebang,
} from './deps.ts'

export type Module = Record<string, unknown>

export interface ImportModuleOptions {
	/** Force the use of the ponyfill even when native dynamic import could be used. */
	force?: boolean
}

export interface ImportStringOptions {
	/** The URL to use as a base for imports and exports in the string. */
	base?: URL | string
}

const denoUserAgentRegex =
	/^Deno\/(?<major>0|[1-9]\d*)\.(?<minor>0|[1-9]\d*)\.(?<patch>0|[1-9]\d*)(?:-(?<prerelease>(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+(?<buildmetadata>[0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/
const isDeno = denoUserAgentRegex.test(navigator.userAgent)
const isDenoCLI = isDeno && Deno.run
const isDenoCompiled = isDenoCLI && dirname(Deno.execPath()) === Deno.cwd()
const isDenoDeploy = isDeno && !isDenoCLI && Deno.env.get('DENO_REGION')
const esbuild = isDenoCLI ? esbuildNative : esbuildWASM
const AsyncFunction = async function () {}.constructor

const posibleDenoConfigurationFilepaths = [
	new URL(`${toFileUrl(Deno.cwd()).href}/deno.json`),
	new URL(`${toFileUrl(Deno.cwd()).href}/deno.jsonc`),
] as const

const compilerOptions = isDeno ? await getDenoCompilerOptions() : null

const sharedEsbuildOptions: esbuildWASM.BuildOptions = {
	jsx: ({
		'preserve': 'preserve',
		'react': 'transform',
		'react-jsx': 'automatic',
		'react-jsxdev': 'automatic',
		'react-native': 'preserve',
	}[compilerOptions?.jsx ?? 'react'] ??
		'transform') as esbuildNative.BuildOptions['jsx'],
	jsxDev: compilerOptions?.jsx === 'react-jsxdev',
	jsxFactory: compilerOptions?.jsxFactory ?? 'h',
	jsxFragment: compilerOptions?.jsxFragmentFactory ?? 'Fragment',
	jsxImportSource: compilerOptions?.jsxImportSource,
	bundle: true,
	platform: 'neutral',
	write: false,
	logLevel: 'silent',
	plugins: [denoPlugin({ useActiveImportMap: true })],
}

async function readTextFile(filepath: URL | string) {
	const base = ErrorStackParser.parse(new Error())[1].fileName
	const url = new URL(filepath, base)

	return await (await fetch(url)).text()
}

async function getDenoCompilerOptions() {
	for (const posibleDenoConfigurationFilepath of posibleDenoConfigurationFilepaths) {
		try {
			return (
				(
					JSON.parse(
						await readTextFile(posibleDenoConfigurationFilepath),
					) as DenoConfigurationFile
				).compilerOptions ?? null
			)
		} catch (_e) {
      return {}
    }
	}

	return null
}

let esbuildInitialized: boolean | Promise<void> = false;
export async function ensureEsbuildInitialized() {
  if (esbuildInitialized === false) {
    if (Deno.run === undefined) {
      const wasmURL = new URL("./esbuild_v0.15.10.wasm", import.meta.url).href;
      esbuildInitialized = fetch(wasmURL).then(async (r) => {
        const resp = new Response(r.body, {
          headers: { "Content-Type": "application/wasm" },
        });
        const wasmModule = await WebAssembly.compileStreaming(resp);
        await esbuild.initialize({
          wasmModule,
          worker: typeof Worker !== 'undefined'
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

async function buildAndEvaluate(options: Record<string, unknown>) {
	!isDenoCLI && await ensureEsbuildInitialized()

	const buildResult = await esbuild.build(
		Object.assign(options, sharedEsbuildOptions),
	)

	isDenoCLI && esbuild.stop()

	const { text = '' } = buildResult.outputFiles?.[0] ?? {}
	const [before, after = '}'] = text.split('export {')
	const body =
		stripShebang(before).replaceAll('import.meta', '{}') +
		'return {' +
		after.replaceAll(
			/(?<local>[\w\W]+) as (?<exported>[\w\W]+)/g,
			'$<exported>: $<local>',
		)

	return AsyncFunction(body)()
}

export async function importModule(
	moduleName: string,
	{ force = false }: ImportModuleOptions = {},
): Promise<Module> {
	try {
		if (force) throw new Error('Forced')

		return await import(moduleName)
	} catch (error) {
		if (!isDenoCompiled && !isDenoDeploy && error.message !== 'Forced')
			throw error

		const base = ErrorStackParser.parse(new Error())[1].fileName
		const entryPoint = resolveModuleSpecifier(moduleName, base, {
			useActiveImportMap: true,
		})
    const ep = removeFilePrefix(entryPoint)
		return await buildAndEvaluate({
			entryPoints: [ep],
		})
	}
}

export async function importString(
	moduleString: string,

	{
		base = ErrorStackParser.parse(new Error())[0].fileName,
	}: ImportStringOptions = {},
) {
	return await buildAndEvaluate({
		stdin: {
			contents: moduleString,
			loader: 'tsx',
			sourcefile: base instanceof URL ? base.href : base,
		},
	})
}