import React from 'react';
import ReactDOM from 'react-dom';

import RootComponent from './RootComponent';

export default async (props = {}) => {
  window.addEventListener('beforeunload', event => {
    if (process.env.NODE_ENV === 'production') {
      event.returnValue = "Stop! You can't return later!";
      return event.returnValue;
    }
  });

  props.rootElement =
    props.rootElement || document.querySelector(`.${CSS_PREFIX}app`);

  return ReactDOM.render(<RootComponent {...props} />, props.rootElement);
};
