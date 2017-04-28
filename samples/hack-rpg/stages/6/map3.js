import Assets from 'hackforplay/Assets';
import {
	gameclear
} from 'utils';
import extra from '../extra';


function gameStartLazy() {
	// プレイヤーが map3 に入ったら
	Hack.maps['map3'].onload = () => {
		// コードをとじる
		feeles.closeCode();
		// YouTubeをとじる
		feeles.closeMedia();
	};

	// かいだん
	const item1 = new RPGObject();
	item1.mod(Hack.assets.upStair);
	// 階段を 14, 5 の位置に移動する　( map3 )
	item1.locate(14, 5, 'map3');
	// 階段を下の方に置く ( Under )
	item1.layer = RPGMap.Layer.Under;
	// 階段にプレイヤーが乗ったら...
	item1.onplayerenter = () => {
		// プレイヤーを 2, 5 の位置に移動する ( map4 )
		Hack.player.locate(2, 5, 'map4');
		// マップ map4 に移動する
		Hack.changeMap('map4');
		// 説明書 4 を表示する
		feeles.openReadme('stages/6/README4.md');

	};


	// 宝箱とコインをたくさん作る
	// 0 なら何も出ないけど、
	// 1 なら宝箱が出るし、
	// 2 ならコインが出る！
	// ためしに数値を書き換えてみよう！
	[
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 2, 1, 1, 1, 2, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 2, 1, 1, 1, 2, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 2, 1, 1, 1, 2, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]

	].forEach((array, y) => {
		array.forEach((value, x) => {
			// もし数値が 1 なら...
			if (value === 1) {
				// 宝箱を出す！
				appearBox(x, y);
			}
			// もし数値が 2 なら...
			if (value === 2) {
				// コインを出す！
				appearCoin(x, y);
			}
		});
	});


	// 宝箱を作るコード （ 関数 ）
	function appearBox(x, y) {

		// はこ
		const item1 = new RPGObject();
		item1.mod(Hack.assets.box);
		// 宝箱を x, y の位置に移動する ( map3 )
		item1.locate(x, y, 'map3');
		// 宝箱にプレイヤーが乗ったら...
		item1.onplayerenter = function() {
			// 宝箱を削除する
			item1.destroy();
			// スコアを 400　アップ！！！！
			Hack.score += 400;
		};
		return item1;

	}

	//　コインを作るコード （ 関数 ）
	function appearCoin(x, y) {

		// コイン
		const item1 = new RPGObject();
		item1.mod(Hack.assets.coin);
		// コインを x, y の位置に作る　( map3 )
		item1.locate(x, y, 'map3');
		// コインにプレイヤーが乗ったら...
		item1.onplayerenter = function() {
			// コインを削除する
			item1.destroy();
			// スコアを 400 アップ！！！！
			Hack.score += 400;
		};
		return item1;

	}

	// このステージを改造
	extra(0, 0, 'map3', 'stages/6/map3.js');
}



function createMap() {

	// map3 というマップを作る
	const mapName = 'map3';

	// 15, 10 の大きさにする ( 32 の部分は書き換えないでください )
	const map = new RPGMap(32, 32, 15, 10);

	map.imagePath = 'enchantjs/x2/dotmat.gif';

	const ___ = -1;

	// マップの地形をつくる
	map.bmap.loadData([
		[55, 55, 55, 55, 55, 55, 55, 55, 55, 55, 55, 55, 55, 55, 55],
		[55, 55, 55, 55, 55, 55, 55, 55, 55, 55, 55, 55, 55, 55, 55],
		[55, 55, 55, 55, 55, 55, 55, 55, 55, 55, 55, 55, 55, 55, 55],
		[55, 55, 55, 55, 55, 55, 55, 55, 55, 55, 55, 55, 55, 55, 55],
		[55, 55, 55, 55, 55, 55, 55, 55, 55, 55, 55, 55, 55, 55, 55],
		[55, 55, 55, 55, 55, 55, 55, 55, 55, 55, 55, 55, 55, 55, 55],
		[55, 55, 55, 55, 55, 55, 55, 55, 55, 55, 55, 55, 55, 55, 55],
		[55, 55, 55, 55, 55, 55, 55, 55, 55, 55, 55, 55, 55, 55, 55],
		[55, 55, 55, 55, 55, 55, 55, 55, 55, 55, 55, 55, 55, 55, 55],
		[55, 55, 55, 55, 55, 55, 55, 55, 55, 55, 55, 55, 55, 55, 55]
	], [
		[323, 54., ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___],
		[35., 15., ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___],
		[___, ___, 16., 75., 75., 75., 75., 75., 17., ___, ___, ___, ___, ___, ___],
		[___, ___, 56., 323, 323, 323, 323, 323, 54., ___, ___, ___, ___, ___, ___],
		[75., 75., 76., 323, 323, 323, 323, 323, 74., 75., 75., 75., 75., 75., 75.],
		[323, 323, 323, 323, 323, 323, 323, 323, 323, 323, 323, 323, 323, 323, 323],
		[35., 35., 36., 323, 323, 323, 323, 323, 34., 35., 35., 35., 35., 35., 35.],
		[___, ___, 56., 323, 323, 323, 323, 323, 54., ___, ___, ___, ___, ___, ___],
		[___, ___, 14., 35., 35., 35., 35., 35., 15., ___, ___, ___, ___, ___, ___],
		[___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___]
	]);


	// マップの歩ける場所を決める
	// 1 なら歩けないし、 0 なら歩ける
	map.cmap = [
		[0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
		[0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
		[0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
		[0, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1],
		[0, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1],
		[1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1],
		[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
		[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
	];


	Hack.maps[mapName] = map;

}


game.on('load', gameStartLazy);
Hack.on('load', createMap);
