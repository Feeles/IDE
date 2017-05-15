'use strict';

const promisify = require('es6-promisify');
const fs = require('fs');

const stat = promisify(fs.stat);
const readdir = promisify(fs.readdir);
const readFile = promisify(fs.readFile);
const version = require('./version');

// build がおわったあと Blob Storage にアップロードしてバージョンをインクリメント
module.exports = class VersioningWebpackPlugin {
  apply(compiler) {
    const azure = require('azure-storage');
    const blobSrv = azure.createBlobService();
    this.createBlockBlob = promisify(
      blobSrv.createBlockBlobFromLocalFile,
      blobSrv
    );

    compiler.plugin('done', this.handleDone.bind(this));
  }

  async handleDone(stats) {
    // path 以下の階層をすべて BlobStorage にアップロード
    this.outputPath = stats.compilation.options.output.path;
    try {
      await this.uploadDir(this.outputPath);
      await version.advance(); // version をインクリメント
      console.log(`🌤 Nice deploying! ${version.currentUrl()}`);
    } catch (e) {
      console.log(e);
    }
  }

  async uploadDir(dirPath) {
    const path = require('path');
    const files = await readdir(dirPath);
    for (const name of files) {
      const fullPath = path.join(dirPath, name);
      const stats = await stat(fullPath);
      if (stats.isDirectory()) {
        // 再帰的にアップロード
        await this.uploadDir(fullPath);
      }
      if (stats.isFile()) {
        await this.upload(fullPath);
      }
    }
  }

  async upload(filePath) {
    const path = require('path');
    // uploadPath === {version.next}/{relative-path}
    const relativePath = path.relative(this.outputPath, filePath);
    const uploadPath = path.join(version.next, relativePath);
    await this.createBlockBlob('public', uploadPath, filePath);
  }
};
