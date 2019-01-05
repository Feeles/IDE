import test from 'ava'
import replaceExistConsts from './replaceExistConsts'

test('replaceExistConsts item', t => {
  const code = `
async function gameFunc() {
	Hack.changeMap('map1'); // map1 をロード


	window.player = new Player(('▼ スキン', Skin.ナイト)); // プレイヤーをつくる
	player.name = 'プレイヤー';
	player.family = ('▼ ファミリー', Family.プレイヤー);
	player.locate(3, 5); // はじめの位置
	player.hp = 3; // 体力
	player.atk = 1; // こうげき力

	// ここからスライム
	const item1 = new RPGObject(('▼ スキン', Skin.スライム));
	item1.family = ('▼ ファミリー', Family.ドクリツ);
	item1.hp = 3;
	item1.atk = 1;
	item1.locate(7, 5, 'map1');
	item1.endless(async (self, count) => {
		await self.attack(); // こうげきする
		/*+ じどう*/
	});
	// ここまでスライム

	/*+ モンスター アイテム せっち システム */

	/*+ スキル */

	game._debug = ('▼ フラグ', false);
}

export default gameFunc;

`
  const asset = `// ここからスライム
const item1 = new RPGObject(('▼ スキン', Skin.スライム));
item1.family = ('▼ ファミリー', Family.ドクリツ);
item1.hp = 3;
item1.atk = 1;
item1.locate(7, 5, 'map1');
item1.endless(async (self, count) => {
    await self.attack(); // こうげきする
    /*+ じどう*/
});
// ここまでスライム`
  const answer = `// ここからスライム
const item2 = new RPGObject(('▼ スキン', Skin.スライム));
item2.family = ('▼ ファミリー', Family.ドクリツ);
item2.hp = 3;
item2.atk = 1;
item2.locate(7, 5, 'map1');
item2.endless(async (self, count) => {
    await self.attack(); // こうげきする
    /*+ じどう*/
});
// ここまでスライム`
  t.is(replaceExistConsts(code, asset), answer)
})

test('replaceExistConsts maps', t => {
  const code = `
async function maps() {
    const map1 = Hack.createMap(\`
322 322 322 322 322 322 322 322 322 322 322 322 322 322 322
322 322 322 322 322 322 322 322 322 322 322 322 322 322 322
322 322 322 322 322 322 322 322 322 322 322 322 322 322 322
322 322 322 322 322 322 322 322 322 322 322 322 322 322 322
322 322 322 322 322 322 322 322 322 322 322 322 322 322 322
322 322 322 322 322 322 322 322 322 322 322 322 322 322 322
322 322 322 322 322 322 322 322 322 322 322 322 322 322 322
322 322 322 322 322 322 322 322 322 322 322 322 322 322 322
322 322 322 322 322 322 322 322 322 322 322 322 322 322 322
322 322 322 322 322 322 322 322 322 322 322 322 322 322 322
    \`);
    Hack.maps.map1 = map1;
    
    /*+ マップ */
}

export default maps;
`
  const asset = `
const map1 = Hack.createMap(\`
322 322 322 322 322 322 322 322 322 322 322 322 322 322 322
322 322 322 322 322 322 322 322 322 322 322 322 322 322 322
322 322 322 322 322 322 322 322 322 322 322 322 322 322 322
322 322 322 322 322 322 322 322 322 322 322 322 322 322 322
322 322 322 322 322 322 322 322 322 322 322 322 322 322 322
322 322 322 322 322 322 322 322 322 322 322 322 322 322 322
322 322 322 322 322 322 322 322 322 322 322 322 322 322 322
322 322 322 322 322 322 322 322 322 322 322 322 322 322 322
322 322 322 322 322 322 322 322 322 322 322 322 322 322 322
322 322 322 322 322 322 322 322 322 322 322 322 322 322 322
\`);
    Hack.maps.map1 = map1;`
  const answer = `
const map2 = Hack.createMap(\`
322 322 322 322 322 322 322 322 322 322 322 322 322 322 322
322 322 322 322 322 322 322 322 322 322 322 322 322 322 322
322 322 322 322 322 322 322 322 322 322 322 322 322 322 322
322 322 322 322 322 322 322 322 322 322 322 322 322 322 322
322 322 322 322 322 322 322 322 322 322 322 322 322 322 322
322 322 322 322 322 322 322 322 322 322 322 322 322 322 322
322 322 322 322 322 322 322 322 322 322 322 322 322 322 322
322 322 322 322 322 322 322 322 322 322 322 322 322 322 322
322 322 322 322 322 322 322 322 322 322 322 322 322 322 322
322 322 322 322 322 322 322 322 322 322 322 322 322 322 322
\`);
    Hack.maps.map2 = map2;`
  t.is(replaceExistConsts(code, asset), answer)
})
