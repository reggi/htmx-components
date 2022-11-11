import type { HTMXProps } from "./htmx_props.ts"


/// <reference no-default-lib="true"/>
/// <reference lib="dom" />
/// <reference lib="dom.asynciterable" />
/// <reference lib="deno.ns" />

export type ElementEvents =
  "animationcancel" |
  "animationend" |
  "animationiteration" |
  "animationstart" |
  "afterscriptexecute" |
  "auxclick" |
  "beforescriptexecute" |
  "blur" |
  "click" |
  "compositionend" |
  "compositionstart" |
  "compositionupdate" |
  "contextmenu" |
  "copy" |
  "cut" |
  "dblclick" |
  "DOMActivate" |
  "DOMMouseScroll" |
  "error" |
  "focusin" |
  "focusout" |
  "focus" |
  "fullscreenchange" |
  "fullscreenerror" |
  "gesturechange" |
  "gestureend" |
  "gesturestart" |
  "gotpointercapture" |
  "keydown" |
  "keypress" |
  "keyup" |
  "lostpointercapture" |
  "mousedown" |
  "mouseenter" |
  "mouseleave" |
  "mousemove" |
  "mouseout" |
  "mouseover" |
  "mouseup" |
  "mousewheel" |
  "msContentZoom" |
  "MSGestureChange" |
  "MSGestureEnd" |
  "MSGestureHold" |
  "MSGestureStart" |
  "MSGestureTap" |
  "MSInertiaStart" |
  "MSManipulationStateChanged" |
  "paste" |
  "pointercancel" |
  "pointerdown" |
  "pointerenter" |
  "pointerleave" |
  "pointermove" |
  "pointerout" |
  "pointerover" |
  "pointerup" |
  "scroll" |
  "select" |
  "show" |
  "touchcancel" |
  "touchend" |
  "touchmove" |
  "touchstart" |
  "transitioncancel" |
  "transitionend" |
  "transitionrun" |
  "transitionstart" |
  "webkitmouseforcechanged" |
  "webkitmouseforcedown" |
  "webkitmouseforceup" |
  "webkitmouseforcewillbegin" |
  "wheel"

type TriggerEvents = ElementEvents | 'search'

type QueueTypes = 'first' | "last" | "all" | "none"

type EventSpace = keyof KeyboardEvent | keyof MouseEvent | keyof TouchEvent | keyof PointerEvent | keyof WheelEvent | keyof Event

type SingleTrigger = Partial<Record<TriggerEvents, true>> & {
  delay?: string,
  throttle?: string,
  from?: string,
  target?: string,
  consume?: boolean,
  queue?: QueueTypes,
  once?: boolean,
  changed?: boolean, 
  filter?: EventSpace | EventSpace[],
  load?: boolean,
  revealed?: boolean,
  intersect?: boolean,
  root?: string,
  threshold?: string,
  every?: string
}

export type Trigger = SingleTrigger | SingleTrigger[]

export const triggerBuilder = (props: HTMXProps, trigger: Trigger) => {
  const t = Array.isArray(trigger) ? trigger : [trigger]
  const current = t.map(v => {
    const x: string[] = []
    Object.entries(v).forEach(([key, value]) => {
      if (value === true) return x.push(key)
      if (key === 'every') return x.push(`every ${value}`)
      if (typeof value === 'string') return x.push(`${key}:${value}`)
    })
    return x.join(' ')
  })
  
  const {
    triggerEvery, triggerEveryCondition, triggerLoad
  } = props

  if (triggerEvery) {
    let v = `every ${triggerEvery}s`
    v = [v, `[${triggerEveryCondition}]`].join(' ')
    current.push(v)
  }

  if (triggerLoad) {
    current.push('load')
  }
  
  return current.join(', ')
}