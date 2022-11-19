import * as path from 'path'
import * as meta from '../core/meta_url.ts'
import { assertEquals } from "$std/testing/asserts.ts";

Deno.test("url test", () => {
  const { metaUrl, metaDir, removeFilePrefix } = meta
  assertEquals(metaUrl(), import.meta.url);
  assertEquals(meta.oneNested(), import.meta.url);
  assertEquals(meta.twoNested(), import.meta.url);
  assertEquals(meta.threeNested(), import.meta.url);
  assertEquals(meta.fourNested(), import.meta.url);
  assertEquals(metaDir(), removeFilePrefix(path.dirname(import.meta.url)));
});
