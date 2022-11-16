import { serve } from "https://deno.land/std@0.161.0/http/server.ts";
import * as path from 'https://deno.land/std@0.163.0/path/mod.ts'
import { parse } from "https://deno.land/std@0.161.0/encoding/yaml.ts";

const cwd = Deno.cwd()

const results = `export const chungus = {
  love: true,
  meow: (v: string) => v
}`

const native = ['ts', 'tsx', 'mts', 'js', 'mjs', 'jsx', 'cjs', 'cts'];
const endsWithAny = (w: string, v: string[]) => v.some((x) => w.endsWith(x));
const endsWithNative = (w: string) => endsWithAny(w, native);

const notFound = `throw new Error("Not a vaid file")`

const yamlFile = (contents: string) => {
  return `export default ${contents} as const`
}

const ContentType = 'application/typescript'
await serve(async (request: Request) => {
  try {
    const relativeFile = new URL(request.url).pathname
    const absoluteFile = path.join(cwd, relativeFile)
    const file = await Deno.readTextFile(absoluteFile)
    if (endsWithNative(absoluteFile)) {
      return new Response(file, { headers: { "content-type": ContentType } })
    }
    if(absoluteFile.endsWith('.yaml') || absoluteFile.endsWith('.yml')) {
      return new Response(yamlFile(JSON.stringify(parse(file), null, 2)), { headers: { "content-type": ContentType } })
    }
    return new Response(results, { headers: { "content-type": ContentType } })
  } catch (e) {
    return new Response(notFound, { headers: { "content-type": ContentType } })
  }
  
}, { port: 1989 });