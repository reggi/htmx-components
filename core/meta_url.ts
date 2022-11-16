import * as nodePath from 'https://deno.land/std@0.150.0/path/mod.ts';

export const metaUrl = () => {
  const error = new Error()
  const lines = error.stack?.split('\n')
  let line = lines && lines.reverse()[0] || ''
  const m = line.match(/at.+\((.+)\)/)
  if (m && m[1]) line = m[1];
  line = line.replace(/\sat\s+/, '')
  line = line.replace(/\:[0-9]+\:[0-9]+/, '')
  line = line.trim()
  return line
}

export const metaDir = () => {
  const core = metaUrl()
  return nodePath.dirname(core.replace('file://', ''))
}