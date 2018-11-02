const keywordRegExps = [/(const\s)(item)(\d+)/gm, /(const\s)(map)(\d+)/gm];

export default function replaceExistConsts(code, text) {
  const cache = {}; // すでに使われている変数名をここに追加していく
  const exists = searchText => {
    if (searchText in cache) return cache[searchText];
    return (cache[searchText] = code.includes(searchText));
  };
  for (const keyword of keywordRegExps) {
    // すでに使われている const item{N} のような変数を探す.
    keyword.lastIndex = 0; // カーソルをリセット
    for (
      let result = keyword.exec(text);
      result !== null;
      result = keyword.exec(text)
    ) {
      // e.g. When 'const item1 = 1;': result === ['const item1', 'const ', 'item', '1']
      const [all, prefix, identifier, init] = result;
      if (!exists(all)) continue; // 被っていない => OK

      // もし名前が競合していたら, number を 1 ずつインクリメントする
      let number = (init >> 0) + 1;
      while (exists(prefix + identifier + number)) number++;

      // ユニークな名前が見つかった => 置き換え
      text = text.split(identifier + init).join(identifier + number);
      cache[prefix + identifier + number] = true; // この変数は使われている
    }
  }
  return text;
}
