/*
 * 〜　コードの世界(せかい)　〜
 * 転移装置(てんいそうち) はコードによって 封印(ふういん) されていた…
 * これでは ステージを 改造(かいぞう) しに行けない！
 * このコードによって、封印を 解除(かいじょ) できるらしいが…
 *
 * 『封印 を '解除' するには、
 * 　どうすればいいだろうか？』
 *
 */

const 封印 = '';

/*
 * ヒントは '' の中に 日本語が入るということだ
 * かきかえたら、右上の [プレイ] をおしてみよう
 */





export const flag = 封印 !== '';
export default function makeMagic(x, y, map, fileName) {
	const magic = new RPGObject();
	magic.mod(Hack.assets.magic);
	magic.locate(x, y, map);
	magic.layer = RPGMap.Layer.Under;
	magic.collisionFlag = false;
	if (flag) {
		magic.mod(Hack.assets.usedMagic);
		magic.onplayerenter = () => {
			if (confirm('このステージを 改造(かいぞう) しますか？')) {
				feeles.openEditor(fileName);
			} else if (confirm('もどりますか？')) {
				feeles.replace('stages/7/index.html');
			}
		};
	}
};
