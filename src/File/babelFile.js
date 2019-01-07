import BabelWorker from '../workers/babel.worker'
import * as Rollbar from '../utils/rollbar'

// WebWorker instance
const worker = new BabelWorker()

// <string, { file, resolve, reject }> map
const pool = new Map()

// Receive messages from Babel
worker.addEventListener('message', event => {
  // Result of transpiling
  const { id, code, error } = event.data
  if (!pool.has(id)) {
    // Not Found Error
    console.warn(`Error in Babel: Unknown id=${id}`, '_File.js:babelFile')
  }
  const { file, resolve, reject } = pool.get(id)
  pool.delete(id)

  if (error) {
    // Got a Babel Error!
    const { loc, message } = error
    const babelError = new Error(message, file.name, loc && loc.line)
    reject(babelError)
    Rollbar.error(babelError)
  } else {
    resolve(
      file.set({
        text: code || file.text // Babel option の ignore に入っている場合は code が null で返される
      })
    )
  }
})

const babelFile = ((count = 0) => file => {
  return new Promise((resolve, reject) => {
    if (file.isScript && file.text.length < 100000) {
      const id = 'unique in babelFile.js:babelFile--' + count++
      // Set into the pool
      pool.set(id, {
        file,
        resolve,
        reject
      })
      // Send messages from Babel
      worker.postMessage({
        id,
        code: file.text,
        options: {
          filename: file.name
        }
      })
    } else {
      resolve(file)
    }
  })
})()

export default babelFile
