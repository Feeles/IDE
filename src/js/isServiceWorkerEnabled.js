let isServiceWorkerEnabled = false;
try {
  isServiceWorkerEnabled =
    navigator.serviceWorker &&
    navigator.serviceWorker.controller &&
    navigator.serviceWorker.controller.state === 'activated';
} catch (e) {

}

export default isServiceWorkerEnabled;
