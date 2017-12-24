import { transform } from 'babel-standalone/babel.min';

self.addEventListener('message', event => {
  let code;
  try {
    // Transpile the code
    code = transform(event.data.code, event.data.options).code;
    // Send result
    self.postMessage({
      id: event.data.id,
      code
    });
  } catch (error) {
    // Throw babel error with processing
    self.postMessage({
      id: event.data.id,
      error: { ...error, message: error.message }
    });
    // Throw useful error info into console
    throw error;
  }
});
