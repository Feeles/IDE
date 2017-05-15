// 仮に手元のファイルとしてあるものを使う
try {
  exports.current = require('./.version');
  exports.next = advance(exports.current);
} catch (e) {
  exports.current = '';
  exports.next = 'v1001';
}

const endpoint = 'https://assets.feeles.com/public';
exports.currentUrl = (pathname = '') =>
  endpoint + require('path').join('/', exports.current, pathname);
exports.nextUrl = (pathname = '') =>
  endpoint + require('path').join('/', exports.next, pathname);
exports.advance = async () => {
  exports.current = exports.next;
  exports.next = advance(exports.next);
  return new Promise((resolve, reject) => {
    const js = `module.exports = ${JSON.stringify(exports.current)}`;
    require('fs').writeFile('.version.js', js, err => {
      if (err) reject(err);
      else resolve(exports.current);
    });
  });
};

function advance(version) {
  const n = version.substr(1) >> 0;
  return `v${n + 1}`;
}
