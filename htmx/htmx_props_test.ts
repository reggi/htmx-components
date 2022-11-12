import { assertEquals } from "https://deno.land/std@0.161.0/testing/asserts.ts";
import { swapBuilder } from "./htmx_props.ts"

Deno.test('swapbuilder', () => {
  const control = "beforebegin swap:1 settle:2 focus-scroll:true scroll:#target:top show:top"
  const test = swapBuilder({
    swapBeforeBegin: true,
    swapTiming: 1,
    swapSettle: 2,
    swapFocusScroll: true,
    swapScroll: "#target:top",
    swapShow: "top"
  })
  assertEquals(test.split(' ').sort(), control.split(' ').sort())
})

Deno.test('swapbuilder with object', () => {
  const control = "beforebegin swap:1 settle:2 focus-scroll:true scroll:#target:top show:top"
  const test = swapBuilder({
    swap: { type: 'beforebegin' }, 
    swapTiming: 1,
    swapSettle: 2,
    swapFocusScroll: true,
    swapScroll: "#target:top",
    swapShow: "top"
  })
  assertEquals(test.split(' ').sort(), control.split(' ').sort())
})