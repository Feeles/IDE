import { BinaryFile, SourceFile, validateType } from './';

export default async script => {
  await 1; // Be asynchronus.

  const name = script.getAttribute('name');
  const type = script.getAttribute('data-type');
  const options = {
    isTrashed: script.hasAttribute('is-trashed')
  };
  const credits = script.hasAttribute('data-credits')
    ? JSON.parse(script.getAttribute('data-credits'))
    : [];
  const lastModified = +script.getAttribute('data-last-modified') || 0;

  const composed = script.textContent;

  if (validateType('blob', type)) {
    return new BinaryFile({
      type,
      name,
      options,
      credits,
      lastModified,
      composed
    });
  } else {
    return new SourceFile({
      type,
      name,
      options,
      credits,
      lastModified,
      composed
    });
  }
};
