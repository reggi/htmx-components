import { Trigger, triggerBuilder } from './htmx_trigger.ts'

export type HTMXSwappingKeys = 'innerHTML' | 'outerHTML' | 'afterbegin' | 'beforebegin' | 'beforeend' | 'afterend' | 'none'
// export type HTMXSwappingAttributes = Partial<Record<`swap${Capitalize<HTMXSwappingKeys>}`, boolean>>
export const methodKeys = ['get', 'post', 'put', 'patch', 'delete' ] as const
export type HTMXMethodKeys = typeof methodKeys[number]
export type HTMXMethodAttributes = Partial<Record<HTMXMethodKeys, string>>
export type HTMXMethodSpreadable = Partial<Record<HTMXMethodKeys, Partial<Record<`hx-${HTMXMethodKeys}`, string>>>>

export interface HTMXSwapOptions {
  type?: HTMXSwappingKeys,
  swap?: string | number,
  timing?: string | number,
  settle?: string | number,
  focusScroll?: boolean,
  scroll?: string,
  show?: string,
  scrollBottom?: boolean,
  scrollTop?: boolean,
  showTop?: boolean,
  showBottom?: boolean,
}

export interface HTMXSwapProps {
  swap?: string | HTMXSwapOptions,
  swapInnerHTML?: boolean
  swapOuterHTML?: boolean
  swapAfterBegin?: boolean
  swapAfterbegin?: boolean
  swapBeforeBegin?: boolean
  swapBeforebegin?: boolean
  swapBeforeend?: boolean
  swapBeforeEnd?: boolean
  swapAfterend?: boolean
  swapAfterEnd?: boolean
  swapNone?: boolean
  swapInner?: boolean
  swapOuter?: boolean
  swapTiming?: string | number
  swapSettle?: string | number
  swapScroll?: string
  swapScrollTop?: boolean
  swapScrollBottom?: boolean
  swapShow?: string
  swapShowTop?: boolean
  swapShowBottom?: boolean
  swapFocusScroll?: boolean
  // different attribute
  swapOob?: boolean
}

export const swapBuilder = (p: HTMXSwapProps): string => {
  const swap = typeof p.swap == 'string' ? [p.swap] : [];
  const s: HTMXSwapOptions = typeof p.swap == 'object' ? p.swap : {};
  if (p.swapInnerHTML || p.swapInner || s.type === 'innerHTML') swap.push('innerHTML')
  if (p.swapOuterHTML || p.swapOuter || s.type === 'outerHTML') swap.push('outerHTML')
  if (p.swapAfterBegin || p.swapAfterbegin || s.type === 'afterbegin') swap.push('afterbegin')
  if (p.swapBeforeBegin || p.swapBeforebegin || s.type === 'beforebegin') swap.push('beforebegin')
  if (p.swapBeforeEnd || p.swapBeforeend || s.type === 'beforeend') swap.push('beforeend')
  if (p.swapAfterend || p.swapAfterEnd || s.type === 'afterend') swap.push('afterend')
  if (p.swapNone || s.type === 'none') swap.push('none')
  if (p.swapTiming || s.timing || s.swap) swap.push(`swap:${p.swapTiming || s.timing || s.swap}`)
  if (p.swapSettle || s.settle) swap.push(`settle:${p.swapSettle || s.settle}`)
  if (p.swapScroll || s.scroll) swap.push(`scroll:${p.swapScroll || s.scroll}`)
  if (p.swapScrollTop || s.scrollTop) swap.push(`scroll:top`)
  if (p.swapScrollBottom || s.scrollBottom) swap.push(`scroll:bottom`)
  if (p.swapShow || s.show) swap.push(`show:${p.swapShow || s.show}`)
  if (p.swapShowTop || s.showTop) swap.push(`show:top`)
  if (p.swapShowBottom || s.showBottom) swap.push(`show:bottom`)
  if (p.swapFocusScroll || s.focusScroll) swap.push(`focus-scroll:true`)
  return swap.join(' ')
}

export interface HTMXProps extends HTMXSwapProps, HTMXMethodAttributes {
  trigger?: Trigger
  triggerEvery?: number
  triggerEveryCondition?: string
  triggerLoad?: boolean
  targetClosest?: string
  targetThis?: boolean
  target?: string
  sync?: string
  select?: string
  confirm?: string
  boost?: boolean
  indicator?: string
  ws?: string
  pushUrl?: boolean
  selectOob?: boolean
  vals?: string
  disableHTMX?: boolean
  disinherit?: string
  encoding?: string
  ext?: string
  headers?: Record<string, unknown>
  historyElt?: boolean
  include?: string
  params?: string | string[]
  paramsNot?: string[]
  paramsNone?: boolean
  preserve?: boolean
  prompt?: string
  replaceUrl?: boolean | string
  
  // request
  request?: string
  requestTimeout?: number
  requestCredentials?: string
  requestCredentialsOmit?: boolean
  requestCredentialsSameOrigin?: boolean
  requestCredentialsInclude?: boolean
  requestNoHeaders?: boolean
  // request short
  req?: string
  reqTimeout?: number
  reqCreds?: string
  reqCredsOmit?: boolean
  reqCredsSameOrigin?: boolean
  reqCredsInclude?: boolean
  reqNoHeaders?: boolean
  // deno-lint-ignore no-explicit-any
  onclick?: any
  // deno-lint-ignore no-explicit-any
  onClick?: any
}

export const decap = (string: string) => {
  return string[0].toLowerCase() + string.substring(1)
}

export const resolveHTMXProps = (props: HTMXProps) => {
  const build: {[key: string]: string}[] = []
  const {
    targetThis, target, targetClosest, trigger, confirm, vals, disableHTMX, disinherit, encoding,
    ext, headers, historyElt, include, params, paramsNot, paramsNone, preserve, prompt,
    replaceUrl,
    request, requestTimeout, requestCredentials, requestCredentialsOmit, requestCredentialsSameOrigin, requestCredentialsInclude, requestNoHeaders,
    req, reqTimeout, reqCreds, reqCredsOmit, reqCredsSameOrigin, reqCredsInclude, reqNoHeaders,
    sync,
    select, selectOob,
    boost, indicator, ws, pushUrl,
    get, post, put, patch, delete: del,


    // remove swaps
    swap: _swap,
    swapInnerHTML: _swapInnerHTML,
    swapOuterHTML: _swapOuterHTML,
    swapAfterBegin: _swapAfterBegin,
    swapAfterbegin: _swapAfterbegin,
    swapBeforeBegin: _swapBeforeBegin,
    swapBeforebegin: _swapBeforebegin,
    swapBeforeend: _swapBeforeend,
    swapBeforeEnd: _swapBeforeEnd,
    swapAfterend: _swapAfterend,
    swapAfterEnd: _swapAfterEnd,
    swapNone: _swapNone,
    swapInner: _swapInner,
    swapOuter: _swapOuter,
    swapTiming: _swapTiming,
    swapSettle: _swapSettle,
    swapScroll: _swapScroll,
    swapScrollTop: _swapScrollTop,
    swapScrollBottom: _swapScrollBottom,
    swapShow: _swapShow,
    swapShowTop: _swapShowTop,
    swapShowBottom: _swapShowBottom,
    swapFocusScroll: _swapFocusScroll,
    // different attribute
    swapOob,

  ...rest} = props
  
  if (boost) build.push({ 'hx-boost': "true" })
  if (get) build.push({ 'hx-get': get })
  if (post) build.push({ 'hx-post': post })
  if (pushUrl) build.push({ 'hx-push-url': "true" })
  if (select) build.push({ 'hx-select': select })
  if (selectOob) build.push({ 'hx-select-oob': 'true' })
  
  const __swap = swapBuilder(props)
  if (__swap) build.push({ 'hx-swap': __swap })
  if (swapOob) build.push({ 'hx-swap-oob': "true" })

  if (targetThis) build.push({ 'hx-target': "this" })
  if (target) build.push({ 'hx-target': target })
  if (targetClosest) build.push({ 'hx-target': `closest ${targetClosest}` })
  if (trigger) build.push({ 'hx-trigger': triggerBuilder(props, trigger) })
  if (vals) build.push({ 'hx-vals': vals })

  if (confirm) build.push({ 'hx-confirm': confirm })
  if (del) build.push({ 'hx-delete': del })
  if (disableHTMX) build.push({ 'hx-disable': "true" })
  if (disinherit) build.push({ 'hx-disinherit': "true" })
  if (encoding) build.push({ 'hx-encoding': encoding })
  if (ext) build.push({ 'hx-ext': ext })
  if (headers) build.push({ 'hx-headers': JSON.stringify(headers) })
  if (historyElt) build.push({ 'hx-history-elt': "true" })
  if (include) build.push({ 'hx-include': include })
  if (indicator) build.push({ 'hx-indicator': indicator })
  
  if (params) build.push({ 'hx-params': (Array.isArray(params) ? params.join(',') : params) })
  if (paramsNot) build.push({ 'hx-params-not': `not ${paramsNot.join(',')}` })
  if (paramsNone) build.push({ 'hx-params': 'none' })

  if (patch) build.push({ 'hx-patch': patch })
  if (preserve) build.push({ 'hx-preserve': "true" })
  if (prompt) build.push({ 'hx-prompt': prompt })
  if (put) build.push({ 'hx-put': put })
  if (replaceUrl) build.push({ 'hx-replace-url': typeof replaceUrl === 'boolean' ? booleanToString(replaceUrl) : replaceUrl  })
  const r = request || req
  if (r) build.push({ 'hx-request': r })

  const _request: { timeout?: number, credentials?: string, noHeaders?: boolean } = {}
  if (requestTimeout || reqTimeout) _request.timeout = requestTimeout || reqTimeout
  if (requestCredentials || reqCreds) _request.credentials = requestCredentials || reqCreds
  if (requestCredentialsOmit || reqCredsOmit) _request.credentials = 'omit'
  if (requestCredentialsSameOrigin || reqCredsSameOrigin) _request.credentials = 'same-origin'
  if (requestCredentialsInclude || reqCredsInclude) _request.credentials = 'include'
  if (requestNoHeaders || reqNoHeaders) _request.noHeaders = true
  if (Object.keys(_request).length > 0) build.push({ 'hx-request': JSON.stringify(_request) })

  if (sync) build.push({ 'hx-sync': sync })
  if (ws) build.push({ 'hx-ws': ws })

  if (props.onClick) build.push({ 'onclick': props.onClick })

  return Object.assign(rest, ...build)
}

const booleanToString = (bool: boolean) => {
  return bool ? 'true' : 'false'
}