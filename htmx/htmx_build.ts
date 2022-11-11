const elements = await Deno.readTextFile("./htmx/elements.txt");
const imports = await Deno.readTextFile("./htmx/htmx_imports.txt");
const template = await Deno.readTextFile("./htmx/htmx_template.txt");

const elementsArray = elements.split("\n")

const capitalize = (string: string) => {
  return string[0].toUpperCase() + string.substring(1)
}

const elementsCode = elementsArray.map(element => {
  return template
    .replaceAll('$elementUpper', capitalize(element))
    .replaceAll('$element', element)
})

const code = [imports,...elementsCode].join('\n')

await Deno.writeTextFile("./htmx/htmx.tsx", code)