import md5 from 'md5';


import {
  BinaryFile,
  SourceFile,
  validateType
} from './';

export default async (script) => {
  await 1; // Be asynchronus.

  const name = script.getAttribute('name');
  const type = script.getAttribute('data-type');
  const options = {
    isTrashed: script.hasAttribute('is-trashed'),
    noBabel: script.hasAttribute('no-babel'),
  };
  const credits = script.hasAttribute('data-credits') ?
    JSON.parse(script.getAttribute('data-credits')) : [];
  const lastModified = +script.getAttribute('data-last-modified') || 0;

  const composed = script.textContent;

  if (validateType('text', type)) {
    return new SourceFile({ type, name, options, credits, lastModified, composed });
  }

  if (validateType('blob', type)) {
    return new BinaryFile({ type, name, options, credits, lastModified, composed });
  }

  throw 'Unknown File Type ' + type;
};
