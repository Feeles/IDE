import init from './jsx/init';
import { default as Feeles } from './jsx/RootComponent';

const h4p = (...args) =>
  new Promise((resolve, reject) => {
    document.readyState === 'complete' ?
      resolve(init(...args)) :
      addEventListener('load', () => {
        return resolve(init(...args));
      });
  });

h4p.init = init;
h4p.Feeles = Feeles;

// Global export
window[EXPORT_VAR_NAME] = h4p;
