import React from 'react';
import md5 from 'md5';
import { parse } from './JSON6';


import _File from './_File';
import configs from './configs';
import { SourceEditor } from '../EditorPane/';
import download from '../html/download';
import composeOgp from './composeOgp';
import { encode, decode } from './sanitizeHTML';

export default class SourceFile extends _File {

  static defaultProps = {
    name: '.SourceFile',
    text: '',
    json: null,
    component: SourceEditor,
    sign: null,
  };

  static defaultOptions = {
    isTrashed: false,
    noBabel: false,
  }

  static visible = _File.visible.concat(
    'text',
    'isScript'
  );

  static watchProps = _File.watchProps.concat(
    'isScript'
  );

  constructor(props) {
    if (props.composed && !props.text) {
      const text = decode(props.composed);
      props = {...props, text};
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
    if (!this.is('json')) {
      return null;
    }
    if (!this._json) {
      const model = Array.from(configs.values())
        .find((config) => config.test.test(this.name));
      const defaultValue = model ? model.defaultValue : {};
      try {
        this._json = {...defaultValue, ...parse(this.text)};
      } catch (e) {
        return {};
      }
    }
    return this._json;
  }

  _hash = null;
  get hash() {
    return this._hash = this._hash || md5(this.text);
  }

  set(change) {
    if (!change.text && this.hash) {
      change.hash = this.hash;
    }
    const seed = {...this.serialize(), ...change};
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
        hash: this.hash,
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
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve(
          new SourceFile({
            type: file.type,
            name: file.name || SourceFile.defaultProps.name,
            text: e.target.result,
            lastModified: file.lastModified,
          })
        );
      };
      reader.readAsText(file);
    });
  }

  static shot(text) {
    return new SourceFile({ type: 'text/javascript', name: '', text });
  }

  static inlineScriptId = `feeles-inline-${CORE_VERSION}`;
  static coreLibFilename = `feeles-${CORE_VERSION}.js`;

  static async embed({ files, coreString, getConfig, deployURL }) {
    const body = `
    <script
      type="text/javascript"
      id="${SourceFile.inlineScriptId}"
` +   (deployURL ? `x-feeles-deploy="${deployURL}"` : '') + `
    >
    ${coreString.replace(/\<\//g, '<\\/')}
    </script>
    <script type="text/javascript">
    ${EXPORT_VAR_NAME}({ inlineScriptId: "${SourceFile.inlineScriptId}" });
    </script>
`;
    return new SourceFile({
      name: getConfig('ogp')['og:title'] + '.html',
      type: 'text/html',
      text: download({
        CSS_PREFIX,
        title: getConfig('ogp')['og:title'],
        files: await Promise.all( files.map((file) => file.compose()) ),
        ogp: composeOgp(getConfig),
        body,
      }),
    });
  }

  static async divide({ files, getConfig, deployURL }) {
    const head = `
    <script
      async
      src="${SourceFile.coreLibFilename}"
` +   (deployURL ? `x-feeles-deploy="${deployURL}"` : '') + `
    ></script>
`;
    return new SourceFile({
      name: getConfig('ogp')['og:title'] + '.html',
      type: 'text/html',
      text: download({
        CSS_PREFIX,
        title: getConfig('ogp')['og:title'],
        files: await Promise.all( files.map((file) => file.compose()) ),
        ogp: composeOgp(getConfig),
        head,
      }),
    });
  }

  static async cdn({ files, src = CORE_CDN_URL, getConfig, deployURL }) {
    const head = `
    <script
      async
      src="${src}"
      onload="${EXPORT_VAR_NAME}()"
` +   (deployURL ? `x-feeles-deploy="${deployURL}"` : '') + `
    ></script>
`;
    return new SourceFile({
      name: getConfig('ogp')['og:title'] + '.html',
      type: 'text/html',
      text: download({
        CSS_PREFIX,
        title: getConfig('ogp')['og:title'],
        files: await Promise.all( files.map((file) => file.compose()) ),
        ogp: composeOgp(getConfig),
        head,
      }),
    });
  }

  static async library({ coreString }) {
    const text = `(function() {
  var e = document.createElement('script');
  e.id = "${SourceFile.inlineScriptId}";
  e.textContent = decodeURIComponent("${encodeURIComponent(coreString)}");
  document.body.appendChild(e);
  ${EXPORT_VAR_NAME}();
})();`;
    return new SourceFile({
      name: SourceFile.coreLibFilename,
      type: 'text/javascript',
      text,
    });
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
      text,
    });
  }

}
