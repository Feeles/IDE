import includes from 'lodash/includes';
import { assetRegExp, codeFolds } from '../../utils/keywords';

/**
 * その text だけを削除したときにコードの健全性が保たれうるかどうか
 * コード全体をパースするのではなく, あくまで行だけを見たときの推測
 * @param {String} text
 * @returns {Boolean} 削除できないとき true
 */
export default function isNotDeletableLine(text) {
  for (const brackets of ['()', '[]', '{}']) {
    const [start, end] = brackets;
    if (text.split(start).length !== text.split(end).length) {
      return true; // ブラケットの数が合わなくなるので削除できない
    }
  }
  if (text.split('`').length - (1 % 2) === 1) {
    return true; // テンプレートリテラルの途中なので削除できない
  }
  for (const declare of ['var ', 'let ', 'const ', 'import ', 'export ']) {
    if (includes(text, declare)) {
      return true; // 変数宣言等が含まれるので削除できない
    }
  }
  if (assetRegExp.test(text)) {
    return true; // アセットのボタンなので削除できない
  }
  if (includes(text, codeFolds.startWord)) {
    return true; // "// ここから" があるので削除できない
  }
  if (includes(text, codeFolds.endWord)) {
    return true; // "// ここまで" があるので削除できない
  }
  if (/import ['"].*['"]/.test(text)) {
    return true; // import 文があるので削除できない
  }
  if (includes(text, '/*') !== includes(text, '*/')) {
    return true; // 複数行コメントが終わらなくなるので削除できない
  }

  return false;
}
