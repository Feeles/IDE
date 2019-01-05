let isServiceWorkerEnabled = false
try {
  isServiceWorkerEnabled =
    navigator.serviceWorker &&
    navigator.serviceWorker.controller &&
    navigator.serviceWorker.controller.state === 'activated'
} catch (e) {
  isServiceWorkerEnabled = false
}

export default isServiceWorkerEnabled
