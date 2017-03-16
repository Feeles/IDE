/*
 * 〜　コードの世界　〜
 * 神殿の転移装置はコードによって封印されていた…
 * これでは ステージを改造しに行けない！
 * 下のコードによって、封印を解除できるらしいが…
 *
 * 『封印 を '解除' するには、
 * 　どうすれば良いだろうか？』
 *
 */

const 封印 = '';

/*
 * ヒントは '' の中に日本語が入るということだ
 * 書きかえたら、右上の プレイ を押してみよう
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
			if (confirm('このステージを改造しますか？')) {
				feeles.openEditor(fileName);
			} else if (confirm('神殿に戻りますか？')) {
				feeles.replace('stages/7/index.html');
			}
		};
	}
};

