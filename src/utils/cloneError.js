export const errorProps = [
  'message',
  'name',
  'fileName',
  'lineNumber',
  'line',
  'columnNumber',
  'column',
  'stack'
]

export default function cloneError(error) {
  if (!error || typeof error !== 'object') return {}
  const clone = {}
  for (const key of errorProps) {
    if (key in error) {
      clone[key] = error[key]
    }
  }
  return clone
}
