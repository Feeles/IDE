import md5 from 'md5';
import { parse } from './JSON6';

import _File from './_File';
import configs from './configs';
import { encode, decode } from './sanitizeHTML';

export default class SourceFile extends _File {
  static defaultProps = {
    name: '.SourceFile',
    text: '',
    json: null,
    sign: null
  };

  static defaultOptions = {
    isTrashed: false
  };

  static visible = _File.visible.concat('text', 'isScript');

  constructor(props) {
    if (props.composed && !props.text) {
      let text = '';
      try {
        // base64 encode された文字列の展開
        text = decodeURIComponent(escape(atob(props.composed)));
      } catch (e) {
        // 旧仕様（sanitizeHTML）で compose された文字列の展開 (backword compatibility)
        text = decode(props.composed);
      }
      props = { ...props, text };
    }

    super(props);
  }

  get text() {
    return this.props.text;
  }

  get isScript() {
    return this.is('javascript');
  }

  static blobCache = new WeakMap();
  get blob() {
    const { blobCache } = this.constructor;
    if (blobCache.has(this)) {
      return blobCache.get(this);
    }
    const blob = new Blob([this.text], { type: this.type });
    blobCache.set(this, blob);
    return blob;
  }

  get json() {
    if (!this._json) {
      const model = Array.from(configs.values()).find(config =>
        config.test.test(this.name)
      );
      const defaultValue = model ? model.defaultValue : {};
      try {
        this._json = { ...defaultValue, ...parse(this.text) };
      } catch (e) {
        return {};
      }
    }
    return this._json;
  }

  _hash = null;
  get hash() {
    return (this._hash = this._hash || md5(this.text));
  }

  set(change) {
    if (!change.text && this.hash) {
      change.hash = this.hash;
    }
    const seed = { ...this.serialize(), ...change };
    seed.key = this.key;
    seed.lastModified = Date.now();

    return new this.constructor(seed);
  }

  compose() {
    const serialized = this.serialize();
    delete serialized.text;
    serialized.composed = encode(this.text);
    if (this.sign && this.sign === this.credit) {
      const credits = this.credits.concat({
        ...this.sign,
        timestamp: Date.now(),
        hash: this.hash
      });
      serialized.credits = JSON.stringify(credits);
    } else {
      serialized.credits = JSON.stringify(this.credits);
    }

    return Promise.resolve(serialized);
  }

  /**
   * @param file File|Blob
   * @return Promise gives SourceFile
   */
  static load(file) {
    return new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = e => {
        resolve(
          new SourceFile({
            type: file.type,
            name: file.name || SourceFile.defaultProps.name,
            text: e.target.result,
            lastModified: file.lastModified
          })
        );
      };
      reader.readAsText(file);
    });
  }

  static shot(text, name = '') {
    return new SourceFile({ type: 'text/javascript', name, text });
  }

  static html() {
    const text = `<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8">
        <title>404 Not Found</title>
    </head>
    <body style="background-color: white;">
      File Not Found
    </body>
</html>`;
    return new SourceFile({
      name: '404.html',
      type: 'text/html',
      text
    });
  }
}
