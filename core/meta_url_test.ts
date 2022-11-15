import { metaUrl } from '../core/meta_url.ts'
import { assertEquals } from "$std/testing/asserts.ts";

const exampleStack = [
  "Error",
  "    at metaUrl (file:///Users/thomasreggi/Documents/GitHub/htmx-components/core/meta_url.ts:3:17)",
  "    at clientImport (file:///Users/thomasreggi/Documents/GitHub/htmx-components/core/client_import.t...",
  "    at HTMXComponents.clientImport (file:///Users/thomasreggi/Documents/GitHub/htmx-components/core/...",
  "    at file:///Users/thomasreggi/Documents/GitHub/htmx-components/examples/98.client-code.tsx:6:21"
]

Deno.test("url test", () => {
  const self = metaUrl()
  assertEquals(self, import.meta.url);
});
