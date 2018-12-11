import test from 'ava';
import fs from 'fs';
import path from 'path';
import convertAsset from './convertAsset';

test('convertAsset', t => {
  const assetPath = path.resolve(
    __dirname,
    '../../samples/hello-world/i18n/ja_JP/feeles/.asset.yml'
  );
  const assetYml = fs.readFileSync(assetPath, { encoding: 'utf8' });
  t.deepEqual(convertAsset([assetYml]), {
    buttons: [ログ, item, _import],
    categories: [],
    scopes: [
      {
        name: 'アセット',
        defaultActiveCategory: -1
      }
    ],
    version: ''
  });
});

const base = {
  scopes: [0], // スコープのインデックスを配列で指定する. null の場合は常に表示
  moduleCode: null, // 改造ボタン用のコード. null の場合は改造不可
  category: -1, // カテゴリーのインデックスを指定する
  iconUrl: null, // アセットのアイコンの URL
  production: true, // www.hackforplay.xyz に表示する場合は true. earlybird だけなら false
  plan: 'free' // 'free' にする
};

const ログ = {
  ...base,
  name: 'ログ',
  description: null,
  insertCode: `console.log(('▼ ドロップダウン', 'ほげ'));\n`,
  filePath: null
};

const item = {
  ...base,
  name: 'item',
  description: 'const item から始まる変数は自動的にインクリメントされる',
  insertCode: `// 変数
const item1 = 1;
item1.toString();
function item1Func() {
  const item2 = 1;
  item2.toString();
}
`,
  filePath: null
};

const _import = {
  ...base,
  name: 'import',
  description: '他のファイルをインポートする',
  insertCode: `import message from 'sub/message';
console.log(message);
`,
  filePath: 'sub/message.js'
};
