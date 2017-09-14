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
  }

  uninstall() {
    this.component = null;
  }

  setState({ files }) {
    if (!files) throw 'Cannot set other than files';
    if (!this.component) throw 'Component is not been set';
    const fileView = new FileView(files);
    fileView.install(this.component);
    return this.component.setStatePromise({ fileView });
  }

  /**
   * ファイルをひとつ追加する
   * @param {SourceFile|BinalyFile} file 追加するファイル
   */
  async addFile(file) {
    const timestamp = file.lastModified || Date.now();
    const remove = this.inspection(file);
    if (file === remove) {
      return file;
    }
    const files = this.files.concat(file).filter(item => item !== remove);

    await this.setState({ files });
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
    const timestamp = nextFile.lastModified || Date.now();
    const remove = this.inspection(nextFile);
    if (remove === nextFile) {
      return prevFile;
    }
    const files = this.files
      .filter(item => item !== remove && item.key !== prevFile.key)
      .concat(nextFile);

    await this.setState({ files });
    this.component.resetConfig(prevFile.name);

    if (this.component.state.project) {
      await putFile(this.component.state.project.id, nextFile.serialize());
    }
    return nextFile;
  }

  /**
   * 任意個数のファイルを削除する
   * @param {Array<SourceFile|BinalyFile>} targets 削除するファイル
   */
  async deleteFile(...targets) {
    const timestamp = Date.now();

    const keys = targets.map(item => item.key);
    const files = this.files.filter(item => !keys.includes(item.key));
    await this.setState({ files });

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
      console.log(newFile);
      if (confirm(this.component.props.localization.common.conflict)) {
        return conflict;
      } else {
        return newFile;
      }
    }

    return null;
  }
}
