import init from './jsx/init';
import { default as Feeles } from './jsx/RootComponent';


const hasLoaded = new Promise((resolve, reject) => {
  if (document.readyState === 'complete') {
    resolve();
  } else {
    window.addEventListener('load', () => resolve());
  }
});

const h4p = async (props) => {
  await hasLoaded;
  init(props);
};

h4p.init = init;
h4p.Feeles = Feeles;

// Global export
window[EXPORT_VAR_NAME] = h4p;


// Auto launch from meta tags
const launch = document.querySelector('script[x-feeles-launch]');
if (launch) {
  const [type, arg] = launch.getAttribute('x-feeles-launch').split(',');
  if (type && arg) {
    h4p({[type]: arg});
  }
}
