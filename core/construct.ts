// deno-lint-ignore-file no-explicit-any
// import { fileName } from './meta_url.ts'
import { bundlePieces } from "./bundle_file.ts";

export const THIS = Symbol('this')
export const EVENT = Symbol('event') as unknown as Event
export const THIS_ELEMENT = Symbol('thisElement') as unknown as HTMLElement

/**
 * 
 * "construct" is a proxy designed to follow the type of any given esmodule
 * 
 * // example.ts
 * ```
 * export const greet = (greeting: string) => `Hello ${greeting}!`
 * ```
 * 
 * // usage.ts
 * 
 * ```
 * import construct from './core/construct.ts'
 * const example = construct(import.meta.url, './example.ts')
 * console.log(example.greet('thomas')) // 'greet('thomas')'
 * ```
 * 
 */

type AsEvaluation = (bundleFile: string, v: string[], args: [], fileName?: string) => string

export function codeProxy (bundleFile: string, asEvaluation: AsEvaluation, fileName?: string) { 
  return new Proxy({}, {
    get (_target: any, prop: any) {
      if (prop === Symbol.toStringTag) {
        return {};
      }
      // https://github.com/denoland/deno/issues/16645
      if (prop === 'then') {
        return {};
      }
      const call = (...args: any) => {
        return asEvaluation(bundleFile, [prop], args, fileName)
      }
      const v: any[] = [prop];
      const guts: any = {
        get (_target: any, prop: any) {
          // console.log(_target, prop, 'b')
          const call = (...args: any) => {
            return asEvaluation(bundleFile, v, args, fileName)
          }
          v.push(prop)
          return new Proxy(call, guts)
        }
      }
      return new Proxy(call, guts)
    }
  })
}

const asEvaluationCall = (v: string[], args: []) => {
  args = args.map(a => {
    if (a === THIS || a === THIS_ELEMENT) {
      return '&this';
    } else if (a === EVENT) {
      return '&event';
    } else {
      return a
    }
  }) as any;
  const isNotExecuted = v[v.length -1 ] == 'valueOf'
  if (isNotExecuted) {
    v.pop()
    return v.join('.')
  } else {
    return `${v.join('.')}(${JSON.stringify(args).replace('"&this"', 'this').replace('"&event"', 'event').replace(/^\[/, '').replace(/\]$/, '')})`
  }
}

const importThenEvaluation = (bundleFile: string, v: string[], args: []) => {
  return `import("${bundleFile}").then(({ ${v[0]} }) => ${asEvaluationCall(v, args)})`
}

export function constructImport <T>(path: string, _v: () => Promise<T>) {
  const bundleFile = bundlePieces(path).pathname
  return codeProxy(bundleFile, importThenEvaluation) as T
}

const evaluation = (_bundleFile: string, v: string[], args: [], fileName?: string) => {
  return `${fileName}.${asEvaluationCall(v, args)}`
}

export function constructBundle <T>(path: string, fileName: string, _v: () => Promise<T>) {
  const bundleFile = bundlePieces(path).pathname
  return codeProxy(bundleFile, evaluation, fileName) as T
}

// const code = constructImport('meosi.js', () => import('../examples/client_code/multi.ts'))
// // console.log(code.new.Dog('fido'))
// console.log(code.alice('home'))
// console.log(code.bob('work'))
// console.log(code.nested.meow('kitty'))
// console.log(code.default())