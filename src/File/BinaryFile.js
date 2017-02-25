import React from 'react';
import md5 from 'md5';


import _File from './_File';
import { Preview } from '../EditorPane/';
import { encode, decode } from './sanitizeHTML';

export default class BinaryFile extends _File {

  static defaultProps = {
    name: '.BinaryFile',
    blob: null,
    component: Preview,
    sign: null,
  };

  static defaultOptions = {
    isTrashed: false,
    noBabel: false,
  }

  static visible = _File.visible.concat(
    'blob'
  );

  static watchProps = _File.watchProps.concat(
  );

  constructor(props) {
    if (props.composed) {
      const bin = atob(decode(props.composed));
      let byteArray = new Uint8Array(bin.length);
      for (let i = bin.length - 1; i >= 0; i--) {
        byteArray[i] = bin.charCodeAt(i);
      }
      const blob = new Blob([byteArray.buffer], {type: props.type});
      const hash = md5(byteArray);
      props = {...props, blob, hash};
    }

    if (props.blob && !props.blobURL) {
      const blobURL = URL.createObjectURL(props.blob);
      props = {...props, blobURL};
    }

    super(props);
  }

  get blob() {
    return this.props.blob;
  }

  get blobURL() {
    return this.props.blobURL;
  }

  get hash() {
    return this.props.hash;
  }

  set(change) {
    if (!change.blob && this.hash) {
      change.hash = this.hash;
    }
    const seed = {...this.serialize(), ...change};
    seed.key = this.key;
    seed.lastModified = Date.now();

    return new BinaryFile(seed);
  }

  async compose() {
    const serialized = this.serialize();
    delete serialized.blob;
    if (this.sign && this.sign === this.credit) {
      const credits = this.credits.concat({
        ...this.sign,
        timestamp: Date.now(),
        hash: this.hash,
      });
      serialized.credits = JSON.stringify(credits);
    } else {
      serialized.credits = JSON.stringify(this.credits);
    }
    const dataURL = await this.toDataURL();
    const base64 = dataURL.substr(dataURL.indexOf(',') + 1);
    serialized.composed = encode(base64);

    return serialized;
  }

  /**
   * @param file File|Blob
   * @return Promise gives BinaryFile
   */
  static load(file) {
    return new Promise((resolve, reject) => {
        // get hash of TypedArray from binary
        const reader = new FileReader();
        reader.onload = (e) => {
          const typedArray = new Uint8Array(e.target.result);
          const hash = md5(typedArray);
          resolve(hash);
        };
        reader.readAsArrayBuffer(file);
      })
      .then((hash) => new BinaryFile({
        type: file.type,
        name: file.name || BinaryFile.defaultProps.name,
        blob: file,
        hash,
        lastModified: file.lastModified,
      }));
  }

}
