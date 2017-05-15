const fs = require('fs');
const promisify = require('es6-promisify');
const writeFile = promisify(fs.writeFile);

// 仮に手元のファイルとしてあるものを使う
const versionFilePath = require('path').resolve(__dirname, '.version');
let currentVersion;
try {
  currentVersion = fs.readFileSync(versionFilePath, 'utf8');
} catch (e) {
  currentVersion = '';
}
console.log(`⏰ Version: ${versionFilePath} => '${currentVersion}'`);

// version を 1 すすめる
const advance = version => {
  if (!version) return 'v1001';
  const n = version.substr(1) >> 0;
  return `v${n + 1}`;
};

const endpoint = 'https://assets.feeles.com/public';
module.exports = {
  // 現在のバージョン
  currentVersion() {
    return currentVersion;
  },
  // 現在から 1 すすんだバージョン
  nextVersion() {
    return advance(currentVersion);
  },
  // 現在のバージョンを提供する CDN URL
  currentUrl(pathname = '') {
    return (
      endpoint + require('path').join('/', this.currentVersion(), pathname)
    );
  },
  // 現在から 1 すすんだバージョンを提供する CDN URL
  nextUrl(pathname = '') {
    return endpoint + require('path').join('/', this.nextVersion(), pathname);
  },
  // 現在のバージョンを 1 すすめる
  async advance() {
    currentVersion = advance(currentVersion);
    await writeFile(versionFilePath, currentVersion);
    return currentVersion;
  }
};
