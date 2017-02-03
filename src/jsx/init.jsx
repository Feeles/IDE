import React from 'react';
import ReactDOM from 'react-dom';
import localforage from 'localforage';


import RootComponent from './RootComponent';
import {
  makeFromElement,
  BinaryFile,
  SourceFile,
  validateType
} from '../File/';

export default async (props = {}) => {

  window.addEventListener('beforeunload', (event) => {
    if (process.env.NODE_ENV === 'production') {
      event.returnValue = "Stop! You can't return later!";
      return event.returnValue;
    }
  });

  props.rootElement = props.rootElement || document.querySelector(`.${CSS_PREFIX}app`);

  if (typeof props.project === 'string') {
    // From localforage
    const store = localforage.createInstance({
      name: 'projects',
      storeName: props.project,
    });
    const keys = await store.keys();

    props.files = keys.map(async (key) => {
      const file = await store.getItem(key);
      if (validateType('text', file.type)) {
        return new SourceFile(file);
      }
      if (validateType('blob', file.type)) {
        return new BinaryFile(file);
      }
    });
    props.localforageInstance = store;

  } else {
    // from script elements
    const query = props.rootElement.getAttribute('data-target');
    props.files = [
      ...document.querySelectorAll(`script${query}`)
    ].map(makeFromElement);

  }

  return ReactDOM.render(
    <RootComponent {...props} />,
    props.rootElement
  );

};
