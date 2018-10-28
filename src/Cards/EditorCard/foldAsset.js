import CodeMirror from 'codemirror';

const prefix = '// ';
const startWord = prefix + 'ここから';
const endWord = prefix + 'ここまで';

/**
 * 「// ここから〇〇」〜「// ここまで〇〇」を fold する
 * @param {CodeMirror} cm
 * @param {CodeMirror.Pos} start
 */
export default function foldAsset(cm, start) {
  const result = {};
  const text = cm.getLine(start.line);
  const startIndex = text.indexOf(startWord);
  if (startIndex < 0) return;

  // startWord が見つかった
  result.from = CodeMirror.Pos(start.line, startIndex + startWord.length);
  const keyword = text.substr(startIndex + startWord.length);

  // 今度は endWord を探す
  const lastLine = cm.lastLine();
  for (let line = start.line + 1; line < lastLine; line++) {
    const text = cm.getLine(line);
    const endIndex = text.indexOf(endWord + keyword);
    if (endIndex >= 0) {
      // endWord も見つかった
      result.to = CodeMirror.Pos(line, endIndex + prefix.length);
      break;
    }
  }

  if (result.from && result.to) {
    return result;
  }
}
