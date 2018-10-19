// raw-loader!escape-loader

import babelStandaloneJs from 'raw-loader!../lib/escape-loader!@babel/standalone/babel.min';
import babelEnvStandaloneJs from 'raw-loader!@babel/preset-env-standalone/babel-preset-env.min.js';

const babelConfig = {
  presets: [
    [
      'env',
      {
        targets: {
          ie: 11
        },
        useBuiltIns: false
      }
    ]
  ]
};

const prefix = `
self.addEventListener("message", function (event) {
  try {
    // Transpile the code
    var result = Babel.transform(event.data.code, ${JSON.stringify(
      babelConfig
    )});
    // Send result
    self.postMessage({
      id: event.data.id,
      code: result && result.code
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
  new Blob([prefix, babelStandaloneJs, babelEnvStandaloneJs], {
    type: 'text/javascript'
  })
);

export default function BabelWorker() {
  return new Worker(url);
}
