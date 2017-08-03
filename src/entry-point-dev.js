/*global ENTRY_POINT_DEV INLINE_SCRIPT_ID*/
if (process.env.NODE_ENV === 'production') {
  throw new Error('Do not exec entry-point-dev.js in production.');
}

// Insert chromosome into body from dist/main.js
const waiting = Promise.resolve()
  .then(() => fetch(`${ENTRY_POINT_DEV}/main.js`))
  .then(response => response.text())
  .then(text => {
    const script = document.createElement('script');
    script.id = INLINE_SCRIPT_ID;
    script.textContent = text;
    document.body.appendChild(script);
  });

// Override launcher
window.h4p = async params => {
  await waiting;
  return window.h4p(params);
};
