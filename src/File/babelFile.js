import BabelWorker from '../workers/babel.worker';

// WebWorker instance
const worker = new BabelWorker();

// <string, { file, resolve, reject }> map
const pool = new Map();

// Receive messages from Babel
worker.addEventListener('message', event => {
  // Result of transpiling
  const { id, code, error } = event.data;
  if (!pool.has(id)) {
    // Not Found Error
    throw new Error(`Error in Babel: Unknown id=${id}`, '_File.js:babelFile');
  }
  const { file, resolve, reject } = pool.get(id);
  pool.delete(id);

  if (error) {
    // Got a Babel Error!
    const { loc, message } = error;
    const babelError = new Error(message, file.name, loc.line);
    reject(babelError);
  } else {
    resolve(file.set({ text: code }));
  }
});

const babelFile = ((count = 0) => (file, babelrc) => {
  return new Promise((resolve, reject) => {
    if (file.isScript && file.text.length < 100000) {
      const id = 'unique in babelFile.js:babelFile--' + count++;
      // Set into the pool
      pool.set(id, { file, resolve, reject });
      // Send messages from Babel
      worker.postMessage({
        id,
        code: file.text,
        options: {
          ...babelrc,
          filename: file.name
        }
      });
    } else {
      resolve(file);
    }
  });
})();

export default babelFile;
