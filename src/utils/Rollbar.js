import rollbar from 'rollbar';

const Rollbar = new rollbar({
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

Rollbar.global({
  itemsPerMinute: 5,
  maxItems: 10
});

export default Rollbar;
