import includes from 'lodash/includes';
import { putFile, deleteFile } from './';

/**
 * ファイルの状態を In Memory & IndexedDB で保有するストア
 * ファイルの探索を手助けする Indexer でもある
 * Redux は使わず、 FileView インスタンスが setState の
 * 参照をもち、外から状態を更新する
 */
export default class FileView {
  constructor(files) {
    this.files = files;
    this._changed = true; // files 変更フラグ
  }

  install(component) {
    this.component = component;
    /* 
	互換性保持のため, つねに最新のステートを参照するAPIをのこす
    いずれ this.state.fileView を直接 propergate させたい
	*/
    component.addFile = this.addFile.bind(this);
    component.putFile = this.putFile.bind(this);
    component.deleteFile = this.deleteFile.bind(this);
    component.findFile = this.findFile.bind(this);
  }

  uninstall() {
    this.component = null;
  }

  setState({ files }) {
    this._changed = true; // Index するフラグ
    if (!files) throw 'Cannot set other than files';
    if (!this.component) throw 'Component is not been set';
    const fileView = new FileView(files);
    fileView.install(this.component);
    return this.component.setStatePromise({
      fileView
    });
  }

  /**
   * ファイルパスでファイルを取得
   * @param {String} path 取得したいファイルのパス
   * @return {SourceFile|BinalyFile|null} ファイルまたは null
   */
  getFileByFullPath(path) {
    this.updateIndex();
    return this.pathToFileMap.get(path);
  }

  /**
   * 任意の拡張子をもつすべてのファイルを取得
   * @param {String} ext 取得したいファイルのパス
   * @return {Array<SourceFile|BinalyFile>} ファイルの配列
   */
  getFilesByExtention(ext) {
    this.updateIndex();
    return this.extToFilesMap.get(ext) || [];
  }

  /**
   * Map を用いてファイル名をインデックス
   * files が変わったら適宜呼び出す
   */
  updateIndex() {
    // files が変更されていればあらたにインデックス
    if (!this._changed) return;
    this._changed = false;

    this.pathToFileMap = new Map();
    this.extToFilesMap = new Map();

    const append = (name, file) => {
      // name => File
      this.pathToFileMap.set(name, file);
      // extention => File
      const [, ...extArray] = name.split('.');
      if (!extArray.length) return;
      const ext = extArray.join('.');
      if (this.extToFilesMap.has(ext)) {
        const files = this.extToFilesMap.get(ext);
        this.extToFilesMap.set(ext, files.concat(file));
      } else {
        this.extToFilesMap.set(ext, [file]);
      }
    };

    // i18n 以外
    const i18n = [];
    for (const file of this.files) {
      if (!file.name.startsWith('i18n/')) {
        append(file.name, file);
      } else {
        i18n.push(file);
      }
    }
    // i18n/{ll_CC} を追加
    const { ll_CC } = this.component.props.localization;
    for (const file of i18n) {
      const [, locale, ...virtualPath] = file.name.split('/');
      if (locale === ll_CC) {
        append(virtualPath.join('/'), file);
      }
    }
  }

  forceUpdate() {
    const fileView = new FileView(this.files);
    fileView.install(this.component);
    return this.component.setStatePromise({
      fileView
    });
  }

  /**
   * ファイルを検索して取得する (後方互換性)
   * @param {String|Function} name ファイル名
   * @param {Boolean} multiple 全件取得フラグ
   */
  findFile(name, multiple = false) {
    if (typeof name === 'string') {
      name = name.replace(/^(\.\/|\/)*/, '');
    }
    const i18nName = `i18n/${this.component.props.localization.ll_CC}/${name}`;
    const pred =
      typeof name === 'function'
        ? name
        : file =>
            !file.options.isTrashed &&
            // 言語設定による動的ファイルパス解決
            (file.name === i18nName ||
              file.moduleName === i18nName ||
              // 通常のファイルパス解決
              file.name === name ||
              file.moduleName === name);

    return multiple ? this.files.filter(pred) : this.files.find(pred) || null;
  }

  /**
   * ファイルをひとつ追加する
   * @param {SourceFile|BinalyFile} file 追加するファイル
   */
  async addFile(file) {
    const remove = this.inspection(file);
    if (file === remove) {
      return file;
    }
    const files = this.files.concat(file).filter(item => item !== remove);

    await this.setState({
      files
    });
    await this.component.resetConfig(file.name);

    if (this.component.state.project) {
      await putFile(this.component.state.project.id, file.serialize());
    }
    return file;
  }

  /**
   * ファイルを置き換える
   * @param {SourceFile|BinalyFile} prevFile 削除するファイル
   * @param {SourceFile|BinalyFile} nextFile 追加するファイル
   */
  async putFile(prevFile, nextFile) {
    console.time('putFile 1');
    const remove = this.inspection(nextFile);
    console.timeEnd('putFile 1');
    if (remove === nextFile) {
      return prevFile;
    }
    const files = this.files
      .filter(item => item !== remove && item.key !== prevFile.key)
      .concat(nextFile);
    console.time('putFile 2');

    await this.setState({
      files
    });
    console.timeEnd('putFile 2');
    console.time('putFile 3');
    this.component.resetConfig(prevFile.name);
    console.timeEnd('putFile 3');

    if (this.component.state.project) {
      console.time('putFile 4');
      await putFile(this.component.state.project.id, nextFile.serialize());
      console.timeEnd('putFile 4');
    }
    return nextFile;
  }

  /**
   * 任意個数のファイルを削除する
   * @param {Array<SourceFile|BinalyFile>} targets 削除するファイル
   */
  async deleteFile(...targets) {
    const keys = targets.map(item => item.key);
    const files = this.files.filter(item => !includes(keys, item.key));
    await this.setState({
      files
    });

    if (this.component.state.project) {
      const fileNames = targets.map(item => item.name);
      await deleteFile(this.component.state.project.id, ...fileNames);
    }
  }

  /**
   * ファイル名の衝突をしらべる. TODO: FileDialog で実現すべき
   * https://trello.com/c/Y4CbIH81/244-conflict-%E3%81%AF%E3%83%80%E3%82%A4%E3%82%A2%E3%83%AD%E3%82%B0%E3%81%AE%E3%81%A8%E3%81%93%E3%82%8D%E3%81%A7%E5%88%A4%E5%AE%9A%E3%81%99%E3%82%8B-filestore-%E3%81%A7%E3%81%AF%E7%84%A1%E8%A6%96
   * @param {Array<SourceFile|BinalyFile>} newFile 追加予定のファイル
   */
  inspection(newFile) {
    const conflict = this.files.find(
      file =>
        !file.options.isTrashed &&
        file.key !== newFile.key &&
        file.name === newFile.name
    );

    if (conflict) {
      // TODO: FileDialog instead of.
      // 一時的に "強制上書き" にする
      console.log(newFile);
      return conflict;
      // if (confirm(this.component.props.localization.common.conflict)) {
      //   return conflict;
      // } else {
      //   return newFile;
      // }
    }

    return null;
  }
}
