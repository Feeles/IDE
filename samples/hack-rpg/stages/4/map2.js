import Assets from 'hackforplay/Assets';
import { gameclear } from 'utils';
import extra from '../extra';


function gameStartLazy() {

	// サファイア
	const item1 = new RPGObject();
	item1.mod(Hack.assets.sapphire);
	// サファイアを 13, 2 の位置に移動する ( map2 )
	item1.locate(13, 2, 'map2');
	// サファイアにプレイヤーが乗ったら...
	item1.onplayerenter = () => {
		// サファイアを削除する
		item1.destroy();
		// スコアを　１００ アップ！
		Hack.score += 100;
	};
	

	// かいだん
	const item2 = new RPGObject();
	item2.mod(Hack.assets.downStair);
	// 階段を 7, 8 の位置に移動する ( map2 )
	item2.locate(7, 8, 'map2');
	// 階段は下の方に置く ( Under )
	item2.layer = RPGMap.Layer.Under;
	// 階段にプレイヤーが乗ったら...
	item2.onplayerenter = () => {
		// マップ map1 に移動する
		Hack.changeMap('map1');
		// プレイヤーを 7, 2 の位置に移動する ( map1 )
		Hack.player.locate(7, 2, 'map1');
		// もしスコアが 100 以上なら...
		if (Hack.score >= 100) {
			// 次のステージに！
			gameclear('stages/5/index.html');
		};
	};



	// スライム軍団をつくる
	
	// 0 ならスライムは出ないけど、
	// 1 ならスライムが出る！
	// ためしに数値を書き換えてみよう！
	[
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
		
	].forEach((array, y) => {
		array.forEach((flag, x) => {
			const n = y * 15 + x;

			// ダミー
			if (!flag) return feeles.exports.push({
				[`slime${n}`]: {}
			});

			// スライム
			const item3 = new RPGObject();
			item3.mod(Hack.assets.slime);
			// スライムの体力
			item3.hp = 999;
			// スライムを　x, y の位置に配置する ( map2 )
			item3.locate(x, y, 'map2');
			// スライムが倒されたら...
			item3.onbecomedead = function() {
				// スコアアップ！
				Hack.score++;
			};
			
			// 魔道書にスライムを登録する
			feeles.exports.push({
				[`slime${n}`]: item3
			});

		});
	});

	// このステージを改造
	extra(9, 9, 'map2', 'stages/4/map2.js');
}




function createMap() {

	// map2 というマップを作る
	const mapName = 'map2';

	// 15, 10 の大きさにする ( 32 の部分は書き換えないでください )
	const map = new RPGMap(32, 32, 15, 10);

	map.imagePath = 'enchantjs/x2/dotmat.gif';

	const ___ = -1;
	
	// マップの地形をつくる
	map.bmap.loadData([
		[323, 323, 323, 323, 323, 323, 323, 323, 323, 323, 323, 323, 323, 323, 323],
		[323, 323, 323, 323, 323, 323, 323, 323, 323, 323, 323, 323, 323, 323, 323],
		[323, 323, 323, 323, 323, 323, 323, 323, 323, 323, 323, 323, 323, 323, 323],
		[323, 323, 323, 323, 323, 323, 323, 323, 323, 323, 323, 323, 323, 323, 323],
		[323, 323, 323, 323, 323, 323, 323, 323, 323, 323, 323, 323, 323, 323, 323],
		[323, 323, 323, 323, 323, 323, 323, 323, 323, 323, 323, 323, 323, 323, 323],
		[323, 323, 323, 323, 323, 323, 323, 323, 323, 323, 323, 323, 323, 323, 323],
		[323, 323, 323, 323, 323, 323, 323, 323, 323, 323, 323, 323, 323, 323, 323],
		[323, 323, 323, 323, 323, 323, 323, 323, 323, 323, 323, 323, 323, 323, 323],
		[323, 323, 323, 323, 323, 323, 323, 323, 323, 323, 323, 323, 323, 323, 323]
	], [
		[320, 320, 320, 320, 320, 320, 320, 320, 320, 320, ___, ___, ___, ___, ___],
		[320, 340, 340, 340, 340, 340, 340, 340, 340, 340, ___, ___, ___, ___, ___],
		[320, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___],
		[320, ___, ___, ___, 340, 340, 340, 340, 320, 320, ___, ___, ___, ___, ___],
		[320, ___, ___, ___, ___, ___, ___, ___, 320, 320, ___, ___, ___, ___, ___],
		[320, 320, 320, 320, 320, 320, 320, ___, 320, 320, 320, 320, 320, 320, 320],
		[320, 320, 320, 320, 320, 320, 340, ___, 340, 320, 320, 320, 320, 320, 320],
		[320, 320, 320, 320, 320, 320, ___, ___, ___, 320, 320, 320, 320, 320, 320],
		[320, 320, 320, 320, 320, 320, ___, ___, ___, 340, 320, 320, 320, 320, 320],
		[340, 340, 340, 340, 340, 340, ___, ___, ___, ___, 340, 340, 340, 340, 340]
	]);

	// マップの歩ける場所を決める
	// 1 なら歩けないし、 0 なら歩ける
	map.cmap = [
		[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0],
		[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0],
		[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0],
		[1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0],
		[1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1],
		[1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1],
		[1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1],
		[1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1],
		[1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1]
	];

	Hack.maps[mapName] = map;

}


game.on('load', gameStartLazy);
Hack.on('load', createMap);