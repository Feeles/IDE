/* global feeles */

const title = 'タイトル';

feeles.connected.then(({ port }) => {
  port.postMessage({
    query: 'menuTitle',
    value: title
  });
});
