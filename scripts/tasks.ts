import * as path from "https://deno.land/std@0.110.0/path/mod.ts";

const core = {
  "build-htmx": "deno run --allow-read --allow-write ./htmx/htmx_build.ts",
  "test": "deno test --config ./tsconfig.json",
  "start": "deno task all-examples",
  "examples": "export NO_SERVE=true && deno run --allow-env --allow-net --allow-read --allow-run --allow-write --watch ./examples/examples.tsx",
  "tasks": "deno run --allow-read --allow-write ./scripts/tasks.ts"
}

const task = (example: Example) => ([example.name, `deno run --allow-env --allow-net --watch ./examples/${example.file}`])

type Example = {index: number, name: string, file: string}
const examples: Example[] = []
for await (const dirEntry of Deno.readDir('./examples')) {
  if (dirEntry.isFile) {
    const [strIndex, name] = path.basename(dirEntry.name, path.extname(dirEntry.name)).split('.')
    const index = parseInt(strIndex)
    if (index) examples.push({ index , name: name.replaceAll('_', '-'), file: dirEntry.name })
  }
}

examples.sort((a, b) => a.index - b.index)

const final = {
  ...core,
  ...Object.fromEntries(Object.entries(examples).map(([_, example]) => {
    return task(example)
  }))
}

const denoJSONText = await Deno.readTextFile('./deno.json')
const denoJSON = JSON.parse(denoJSONText)

denoJSON.tasks = final

await Deno.writeTextFile('./deno.json', JSON.stringify(denoJSON, null, 2))
