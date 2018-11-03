import beautify from 'js-beautify';

/**
 *
 * @param {String} source
 * @param {Object} options
 * @param {String} uniqueLineEnd  スペースだけの行に付け加えるユニークな文字列. これがソースに含まれているといけない
 */
export default function preserveTrailingSpaceBeautify(
  source,
  options,
  uniqueLineEnd = '///DtpOmVZptu'
) {
  if (source.includes(uniqueLineEnd + '\n')) {
    return preserveTrailingSpaceBeautify(
      source,
      options,
      uniqueLineEnd + 'MrhbRewZAi'
    ); // ユニークになるまで...
  }

  source = source.replace(/^([ \t]+)$/gm, '$1' + uniqueLineEnd); // 行をトリムされないようにする
  if (source.endsWith(uniqueLineEnd)) {
    // ファイル末尾のインデントは trim する
    source = source.substr(0, source.length - uniqueLineEnd.length);
  }
  source = beautify(source, options);
  source = source.split(uniqueLineEnd + '\n').join('\n'); // 元に戻す

  return source;
}
