import { useId } from 'preact/hooks'
import { render } from 'preact-async-render-to-string'
import { assertEquals } from "https://deno.land/std@0.161.0/testing/asserts.ts";
import { asyncComponent } from '../core/async_component.tsx'

Deno.test('render test', async () => {
  assertEquals(await render(<div>test</div>), '<div>test</div>')
})

Deno.test('async render test', async () => {
  const AsyncFunc = asyncComponent(async () => {
    const data = await Promise.resolve('test')
    return <div>{data}</div>
  })
  assertEquals(await render(<AsyncFunc/>), '<div>test</div>')
})

Deno.test('async render test with hook', async () => {
  const AsyncFunc = asyncComponent(async () => {
    const hook = useId()
    const data = await Promise.resolve('test')
    return <div id={hook}>{data}</div>
  })
  assertEquals(await render(<AsyncFunc/>), '<div id="P481">test</div>')
})