/* global feeles */

const title = 'Title';

feeles.connected.then(({ port }) => {
  port.postMessage({
    query: 'menuTitle',
    value: title
  });
});
