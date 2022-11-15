
export const metaUrl = () => {
  const error = new Error()
  const lines = error.stack?.split('\n')
  let line = lines && lines[2] || ''
  line = line.replace('at', '')
  line = line.replace(/\:[0-9]+\:[0-9]+/, '')
  return line.trim()
}