// deno-lint-ignore-file no-explicit-any

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

export function codeProxy () { 
  return new Proxy({}, {
    get (_target: any, prop: any) {
      if (prop === Symbol.toStringTag) {
        return {};
      }
      console.log(_target, prop, 'a')
      const call = (...args: any) => {
        return asEvaluation([prop], args)
      }
      const v: any[] = [prop];
      const guts: any = {
        get (_target: any, prop: any) {
          console.log(_target, prop, 'b')
          const call = (...args: any) => {
            return asEvaluation(v, args)
          }
          v.push(prop)
          return new Proxy(call, guts)
        }
      }
      return new Proxy(call, guts)
    }
  })
}

const asEvaluation = (v: string[], args: []) => {
  const isNotExecuted = v[v.length -1 ] == 'valueOf'
  if (isNotExecuted) {
    v.pop()
    return v.join('.')
  } else {
    return `${v.join('.')}(${JSON.stringify(args).replace(/^\[/, '').replace(/\]$/, '')})`
  }
}

export function constructImport <T>(_v: () => Promise<T>) {
  return codeProxy() as T
}

// const code = clientImport(() => import('../examples/client_code/multi.ts'))
// // console.log(code.new.Dog('fido'))
// console.log(code.alice('home'))
// console.log(code.bob('work'))
// console.log(code.nested.meow('kitty'))
// console.log(code.default())