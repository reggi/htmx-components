import { Trigger, triggerBuilder } from './htmx_trigger.ts'

export type HTMXSwappingKeys = 'innerHTML' | 'outerHTML' | 'afterbegin' | 'beforebegin' | 'beforeend' | 'afterend' | 'none'
export type HTMXSwappingAttributes = Partial<Record<`swap${Capitalize<HTMXSwappingKeys>}`, boolean>>
export const methodKeys = ['get', 'post', 'put', 'patch', 'delete' ] as const
export type HTMXMethodKeys = typeof methodKeys[number]
export type HTMXMethodAttributes = Partial<Record<HTMXMethodKeys, string>>
export type HTMXMethodSpreadable = Partial<Record<HTMXMethodKeys, Partial<Record<`hx-${HTMXMethodKeys}`, string>>>>

export interface HTMXProps extends HTMXSwappingAttributes, HTMXMethodAttributes {
  swapInner?: boolean,
  swapOuter?: boolean,
  trigger?: Trigger
  triggerEvery?: number
  triggerEveryCondition?: string
  triggerLoad?: boolean

  targetThis?: boolean
  target?: string
  sync?: string
  swapOob?: boolean
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
}

export const decap = (string: string) => {
  return string[0].toLowerCase() + string.substring(1)
}

export const resolveHTMXProps = (props: HTMXProps) => {
  const build: {[key: string]: string}[] = []
  const {
    targetThis, target, trigger, confirm, vals, disableHTMX, disinherit, encoding,
    ext, headers, historyElt, include, params, paramsNot, paramsNone, preserve, prompt,
    replaceUrl,
    request, requestTimeout, requestCredentials, requestCredentialsOmit, requestCredentialsSameOrigin, requestCredentialsInclude, requestNoHeaders,
    req, reqTimeout, reqCreds, reqCredsOmit, reqCredsSameOrigin, reqCredsInclude, reqNoHeaders,
    sync, swapOob,
    select, selectOob,
    boost, indicator, ws, pushUrl,
    swapInner, swapOuter,
    swapInnerHTML, swapOuterHTML, swapAfterbegin, swapBeforebegin, swapBeforeend, swapAfterend, swapNone,
    get, post, put, patch, delete: del,
  ...rest} = props
  
  if (boost) build.push({ 'hx-boost': "true" })
  if (get) build.push({ 'hx-get': get })
  if (post) build.push({ 'hx-post': post })
  if (pushUrl) build.push({ 'hx-push-url': "true" })
  if (select) build.push({ 'hx-select': select })
  if (selectOob) build.push({ 'hx-select-oob': 'true' })
  if (swapInnerHTML || swapInner) build.push({ 'hx-swap': "innerHTML" }) // swaps
  if (swapOuterHTML || swapOuter) build.push({ 'hx-swap': "outerHTML" })
  if (swapAfterbegin) build.push({ 'hx-swap': "afterbegin" })
  if (swapBeforebegin) build.push({ 'hx-swap': "beforebegin" })
  if (swapBeforeend) build.push({ 'hx-swap': "beforeend" })
  if (swapAfterend) build.push({ 'hx-swap': "afterend" })
  if (swapNone) build.push({ 'hx-swap': "none" })
  if (swapOob) build.push({ 'hx-swap-oob': "true" })
  if (targetThis) build.push({ 'hx-target': "this" })
  if (target) build.push({ 'hx-target': target })
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
  return Object.assign(rest, ...build)
}

const booleanToString = (bool: boolean) => {
  return bool ? 'true' : 'false'
}