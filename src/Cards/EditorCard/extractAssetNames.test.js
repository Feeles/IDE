import test from 'ava'
import extractAssetNames from './extractAssetNames'

const cases = [
  {
    // double quote
    code: `rule.つくる("プレイヤー")`,
    assetNames: ['プレイヤー']
  },
  {
    // 2 assets per line
    code: `rule.つくる('プレイヤー')rule.つくる('スライム')`,
    assetNames: ['プレイヤー', 'スライム']
  },
  {
    // しょうかんする
    code: `this.しょうかんする('ボム')`,
    assetNames: ['ボム']
  },
  {
    // へんしんする
    code: `this.へんしんする('赤色のスライム')`,
    assetNames: ['赤色のスライム']
  },
  {
    // real code
    code: `
// import 'https://unpkg.com/@hackforplay/common@^0.11/dist/register.js';

rule.ゲームがはじまったとき(async function() {
	// マップ（β版）のコードは、この下に貼り付ける
	
	Hack.changeMap('map1'); // map1 をロード
	
	rule.つくる('プレイヤー', 3, 5, 'map1', ('▼ むき', Dir.した));
	
	rule.つくる('青色のスライム', 1, 4, 'map1', ('▼ むき', Dir.ひだり))

	/*+ ゲームがはじまったとき */
});`,
    assetNames: ['プレイヤー', '青色のスライム']
  },
  {
    code: '',
    assetNames: []
  }
]

const invalids = [
  {
    code: {}
  }
]

test('extractAssetNames', t => {
  for (const { code, assetNames } of cases) {
    t.deepEqual(extractAssetNames(code), assetNames)
  }
  for (const { code } of invalids) {
    t.throws(() => extractAssetNames(code))
  }
})
