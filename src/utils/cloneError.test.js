import test from 'ava'
import cloneError, { errorProps } from './cloneError'

const errors = [
  new Error('Error Message'),
  new TypeError('Type Error'),
  'Error String'
]

test('cloneError', t => {
  for (const item of errors) {
    const clone = cloneError(item)
    for (const key of errorProps) {
      t.is(clone[key], item[key], key)
    }
  }
})
