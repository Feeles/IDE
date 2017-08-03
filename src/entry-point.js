/*global INLINE_SCRIPT_ID*/
import chromosome from '!raw-loader!../dist/main';

new Promise((resolve, reject) => {
  if (document.body) resolve();
  else window.addEventListener('load', resolve);
}).then(() => {
  // Insert chromosome as an element
  const script = document.createElement('script');
  script.id = INLINE_SCRIPT_ID;
  script.textContent = chromosome;
  document.body.appendChild(script);
});
