import rollbar from 'rollbar-browser';

export default rollbar.init({
  enabled: !!process.env.ROLLBAR,
  accessToken: process.env.ROLLBAR,
  captureUncaught: true,
  captureUnhandledRejections: true,
  payload: {
    environment: process.env.NODE_ENV,
    client: {
      version: CORE_VERSION
    }
  }
});
