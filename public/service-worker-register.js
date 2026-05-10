// Registers the offline-first service worker once the page has loaded.
// Wrapped in a feature check so non-PWA browsers are a no-op.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function () {
    navigator.serviceWorker.register('/service-worker.js').catch(function () {});
  });
}
