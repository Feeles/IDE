const isServiceWorkerEnabled =
  navigator.serviceWorker &&
  navigator.serviceWorker.controller &&
  navigator.serviceWorker.controller.state === 'activated';

export default isServiceWorkerEnabled;
