import test from 'ava'
import separate from './separate'

const cases = {
  'root/sub/file.js': {
    path: 'root/sub/',
    plain: 'file',
    ext: '.js',
    name: 'root/sub/file.js',
    moduleName: 'root/sub/file'
  }
}

test('separate file path', t => {
  for (const key of Object.keys(cases)) {
    t.deepEqual(separate(key), cases[key])
  }
})
