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

  setState({ files }) {
    if (!files) throw 'Cannot set other than files';
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
    const remove = this.component.inspection(file);
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
    const remove = this.component.inspection(nextFile);
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
}
