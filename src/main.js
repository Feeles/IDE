import * as ReactDOM from 'react-dom';
import init from './jsx/init';
import { default as Feeles } from './jsx/RootComponent';

const hasLoaded = new Promise(resolve => {
  if (document.readyState === 'complete') {
    resolve();
  } else {
    window.addEventListener('load', () => resolve());
  }
});

const h4p = async props => {
  await hasLoaded;
  init(props);
};

h4p.init = init;
h4p.Feeles = Feeles;
h4p.unmount = (...args) => ReactDOM.unmountComponentAtNode(...args);

// Auto launch from meta tags
const launch = document.querySelector('script[x-feeles-launch]');
if (launch) {
  const [type, arg] = launch.getAttribute('x-feeles-launch').split(',');
  h4p({ [type]: arg });
}

// export
export { h4p };
