'use strict'

const fs = require('fs');
const path = require('path');
const mime = require('mime');


module.exports =
class FeelesWebpackPlugin {
  constructor(params) {
    params = Object.assign({
      path: 'mount',
      ignore: /[]/,
    }, params);
    this.fileTimestamps = new Map();
    this.filePromises = new Map();
    this.mountDir = path.resolve(params.path);
    this.ignore = params.ignore;
  }

  apply(compiler) {
    // コンパイル開始
    compiler.plugin('compilation', (compilation, params) => {
      const pushDirFiles = (dirPath) => {
        for (const name of fs.readdirSync(dirPath)) {
          const targetPath = path.resolve(dirPath, name);
          const stat = fs.statSync(targetPath);
          if (stat.isFile() && !this.ignore.test(targetPath)) {
            // 次の emit の compilation.fileDependencies に含める
            params.compilationDependencies.push(targetPath);
          }
          if (stat.isDirectory()) {
            pushDirFiles(targetPath);
          }
        }
      };
      pushDirFiles(this.mountDir);
    });

    compiler.plugin('emit', (compilation, callback) => {
      // すべてのファイルを JSON にシリアライズ

      const targetFiles = compilation.fileDependencies.filter(filePath => {
        return !filePath.indexOf(this.mountDir) && !this.ignore.test(filePath);
      });

      for (const filePath of targetFiles) {
        const lastModified = compilation.fileTimestamps[filePath] || Date.now();
        const lastCached = this.fileTimestamps.get(filePath) || 0;
        if (lastModified > lastCached) {
          this.filePromises.set(filePath, this.loadFile(filePath));
          this.fileTimestamps.set(filePath, lastModified);
        }
      }

      for (const cachedPath of this.filePromises.keys()) {
        if (targetFiles.indexOf(cachedPath) < 0) {
          this.filePromises.delete(cachedPath);
        }
      }

      Promise.all(this.filePromises.values())
        .then(files => {
          console.log(`Feeles: ${this.filePromises.size} files mounted in ${this.mountDir}`);
          const json = JSON.stringify(files);
          compilation.assets['index.json'] = {
            source() {
              return json;
            },
            size() {
              return json.length;
            }
          };

          callback();
        });
    });

    compiler.plugin('after-emit', (compilation, callback) => {
      // 次の emit の compilation.fileDependencies に含める
      compilation.contextDependencies.push(this.mountDir);
      callback();
    });
  }

  loadFile(filePath) {
    return Promise.resolve({
      name: path.relative(this.mountDir, filePath),
      type: mime.lookup(filePath),
      lastModified: Date.parse(fs.statSync(filePath).mtime),
      composed: fs.readFileSync(filePath, 'base64'),

      options: {
          isTrashed: false,
          noBabel: false
      },
      credits: [],
    });
  }
}
