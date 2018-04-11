// raw-loader!escape-loader

import babelStandaloneJs from 'raw-loader!../lib/escape-loader!babel-standalone/babel.min';

const prefix = `
self.addEventListener("message", function (event) {
  try {
    // Transpile the code
    var code = Babel.transform(event.data.code, event.data.options).code;
    // Send result
    self.postMessage({
      id: event.data.id,
      code: code
    });
  } catch (error) {
    // Throw babel error with processing
    self.postMessage({
      id: event.data.id,
      error: { message: error.message, loc: error.loc }
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
