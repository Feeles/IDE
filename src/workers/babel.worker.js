// raw-loader!escape-loader

import babelStandaloneJs from 'raw-loader!../lib/escape-loader!@babel/standalone/babel.min';

const prefix = `
self.addEventListener("message", function (event) {
  try {
    // Transpile the code
    var result = Babel.transform(event.data.code, event.data.options);
    // Send result
    self.postMessage({
      id: event.data.id,
      code: result && result.code
    });
  } catch (error) {
    // Throw babel error with processing
    self.postMessage({
      id: event.data.id,
      error: {
        code: error.code + '',
        message: error.message + '',
        stack: error.stack + '',
        loc: error.loc && {
          line: error.loc.line,
          column: error.loc.column
        },
        missingPlugin: error.missingPlugin
      }
    });
    // Show useful error info into console
    console.warn(error);
  }
});
`;

const url = URL.createObjectURL(
  new Blob([prefix, babelStandaloneJs], {
    type: 'text/javascript'
  })
);

export default function BabelWorker() {
  return new Worker(url);
}
