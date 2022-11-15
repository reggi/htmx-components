import { metaUrl } from '../core/meta_url.ts'
import { assertEquals } from "$std/testing/asserts.ts";

Deno.test("url test", () => {
  const self = metaUrl()
  assertEquals(import.meta.url, self);
});
