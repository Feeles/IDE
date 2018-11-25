import { separate, validateType } from './';
import babelFile from './babelFile';

export default class _File {
  static defaultProps = {};

  static defaultOptions = {};

  static visible = [
    'name',
    'moduleName',
    'type',
    'lastModified',
    'options',
    'credits',
    'sign'
  ];

  constructor(props) {
    this.key = props.key || getUniqueId();

    const lock = (...args) => Object.freeze(Object.assign({}, ...args));
    this.props = lock(this.constructor.defaultProps, props);
    this.options = lock(this.constructor.defaultOptions, this.props.options);

    this._separate = separate(this.props.name);
  }

  get name() {
    return this._separate.name;
  }

  get moduleName() {
    return this._separate.moduleName;
  }

  get path() {
    return this._separate.path;
  }

  get plain() {
    return this._separate.plain;
  }

  get ext() {
    return this._separate.ext;
  }

  get type() {
    return this.props.type;
  }

  get component() {
    return this.props.component;
  }

  get header() {
    if (this.is('markdown')) {
      return this.text
        .trim() // 前後の空白を削除
        .replace(/\n[^]*$/, '') // 改行以降を削除
        .trim() // 前後の空白を削除
        .replace(/^[#-]*\s*/, '') // 行頭の # - を削除
        .replace(/[*~_[\]()`]/g, ''); // * ~ _ [] () `` を削除
    }
    return this.plain + this.ext;
  }

  get credits() {
    return this.props.credits instanceof Array ? this.props.credits : [];
  }

  get sign() {
    return this.props.sign;
  }

  get credit() {
    const credit = this.credits.find(item => item.hash === this.hash);
    if (credit) {
      return credit;
    }

    return this.sign || null;
  }

  get isTrashed() {
    return !!this.options.isTrashed;
  }

  static _dataURLCache = new WeakMap();
  async toDataURL() {
    const { _dataURLCache } = this.constructor;

    if (_dataURLCache.has(this)) {
      return _dataURLCache.get(this);
    }
    return await new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = () => {
        const { result } = reader;
        _dataURLCache.set(this, result);
        resolve(result);
      };
      reader.readAsDataURL(this.blob);
    });
  }

  async collect() {
    const dataURL = await this.toDataURL();
    return {
      name: this.name,
      type: this.type,
      lastModified: this.lastModified,
      composed: dataURL.substr(dataURL.indexOf(',') + 1),
      options: this.options,
      credits: this.credits
    };
  }

  get error() {
    throw 'file.error is unsupported';
  }

  get lastModified() {
    return this.props.lastModified || 0;
  }

  is(name) {
    return validateType(name, this.type);
  }

  static _babelCache = new WeakMap();
  async babel() {
    const { _babelCache } = this.constructor;
    if (_babelCache.has(this)) return _babelCache.get(this);
    const promise = babelFile(this);
    _babelCache.set(this, promise);
    return promise;
  }

  rename(newName) {
    const { path, ext } = this;
    const name = path + newName + ext;

    return this.set({
      name
    });
  }

  move(newPath) {
    if (newPath.lastIndexOf('/') !== newPath.length - 1) {
      newPath += '/';
    }

    const { plain, ext } = this;
    const name = newPath + plain + ext;

    return this.set({
      name
    });
  }

  serialize() {
    const obj = Object.create(null);
    this.constructor.visible.forEach(key => {
      obj[key] = this[key];
    });
    return obj;
  }
}

const getUniqueId = (i => () => '_File__' + ++i)(0);
