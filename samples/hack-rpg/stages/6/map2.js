import Assets from 'hackforplay/Assets';
import { gameclear, mergeBMap } from 'utils';
import extra from '../extra';



function gameStartLazy() {

	// ドラゴン
	const item1 = new RPGObject();
	item1.mod(Hack.assets.dragon);
	// ドラゴンの体力
	item1.hp = 16;
	// ドラゴンの位置を調整する
	item1.offset = {
		x: -32,
		y: -60
	};
	// ドラゴンを 11, 5 の位置に移動する ( map2 )
	item1.locate(11, 5, 'map2');
	// ドラゴンを拡大する ( ２　倍に　)
	item1.scale(2, 2);
	// ドラゴンの動きを設定する
	item1.setFrame('Idle', [10]);
	//　ドラゴンを更新する...
	item1.onenterframe = () => {

		// 炎を作る
		const effect1 = new Effect(-3, 5, 40, true);
		// 炎にさわれないようにする
		effect1.collisionFlag = false;
		// 炎の位置をドラゴンの位置から -2, -1 の位置に移動する ( map 2 )
		effect1.locate(item1.mapX - 2, item1.mapY - 1, 'map2');
		// 炎の動きを設定する
		effect1.force(0, -0.1);
		// 炎に何かが当たったら...
		effect1.ontriggerenter = (event) => {
			// ドラゴン以外に当たったら...
			if (event.hit !== item1) {
				// 10 ダメージの攻撃！
				Hack.Attack(event.mapX, event.mapY, 10);
			}
		};

		if (game.frame % 30 > 0) return;

		//　炎を作る
		const effect2 = new Effect(-3, 5, 40);
		// 炎にさわれないようにする
		effect2.collisionFlag = false;
		// 炎の位置をドラゴンの位置から -2, -1 の位置に移動する ( map 2 )
		effect2.locate(item1.mapX - 2, item1.mapY - 1);
		// 炎の動きを設定する 1
		effect2.force(0, -0.1);
		// 炎の動きを設定する 2
		effect2.velocityX = 0;
		// 炎が何かに当たったら...
		effect2.ontriggerenter = (event) => {
			// ドラゴン以外に当たったら...
			if (event.hit !== item1) {
				// 450 ダメージの攻撃！！！！
				Hack.Attack(event.mapX, event.mapY, 450);
			}
		};

	};

	// dragon をコードから利用可能に
	feeles.exports.push({ dragon: item1 });

	// 	Life gage
	// 体力ゲージを作る
	const MAX = item1.hp;
	const bar1 = new Sprite(480, 32);
	bar1.image = game.assets['hackforplay/bar_red.png'];
	// 体力ゲージの位置
	bar1.moveTo(0, 0);
	// 体力ゲージを更新する...
	bar1.onenterframe = function() {
		// map2 じゃないなら表示しない
		bar1.visible = Hack.map === Hack.maps['map2'];
		item1.hp = Math.min(item1.hp, MAX);
		// ゲージの長さを設定する
		bar1.width = 480 * item1.hp / MAX;
	};
	Hack.menuGroup.addChild(bar1);


	// ルビー
	const item2 = new RPGObject();
	item2.mod(Hack.assets.ruby);
	// ルビーを 11, 5 の位置に移動する ( map2 )
	item2.locate(11, 5, 'map2');
	// ルビーにプレイヤーが乗ったら...
	item2.onplayerenter = function() {
		// 階段を作る！
		// もう少し下のところに階段を作るコードが書いてあるよ！
		appearDownStair();
		// ルビーを削除する
		item2.destroy();
	};

	// ruby をコードから利用可能に
	feeles.exports.push({ ruby: item2 });

	// 階段を作るコード （ 関数 )
	function appearDownStair() {

		// かいだん
		const item3 = new RPGObject();
		item3.mod(Hack.assets.downStair);
		// 階段を 14, 5 の位置に移動する ( map2 )
		item3.locate(14, 5, 'map2');
		// 階段にプレイヤーが乗ったら...
		item3.onplayerenter = function() {
			// マップ map3 に移動する
			Hack.changeMap('map3');
			// プレイヤーを 2, 5 の位置に移動する ( map3 )
			Hack.player.locate(2, 5, 'map3');
			// 説明書 3 を表示する
			feeles.openReadme('stages/6/README3.md');
		};

	}
	
	// このステージを改造
	extra(0, 0, 'map2', 'stages/6/map2.js');
};




function createMap() {
	
	//　map2 というマップを作る
	const mapName = 'map2';

	// 15, 10 の大きさにする ( 32 の部分は書き換えないでください )
	const map = new RPGMap(32, 32, 15, 10);

	map.imagePath = 'enchantjs/x2/dotmat.gif';

	const ___ = -1;
	
	// マップの地形をつくる
	map.bmap.loadData([
		[323, 54., 55., 55., 55., 55., 55., 55., 55., 55., 55., 55., 55., 55., 55.],
		[35., 15., 55., 55., 55., 55., 55., 55., 55., 55., 55., 55., 55., 55., 55.],
		[55., 55., 55., 55., 55., 55., 55., 55., 55., 55., 55., 55., 55., 55., 55.],
		[55., 55., 55., 55., 55., 55., 55., 55., 55., 55., 55., 55., 55., 55., 55.],
		[75., 75., 75., 75., 75., 75., 75., 75., 75., 75., 75., 75., 75., 75., 75.],
		[323, 323, 323, 323, 323, 323, 323, 323, 323, 323, 323, 323, 323, 323, 323],
		[35., 35., 35., 35., 35., 35., 35., 35., 35., 35., 35., 35., 35., 35., 35.],
		[55., 55., 55., 55., 55., 55., 55., 55., 55., 55., 55., 55., 55., 55., 55.],
		[55., 55., 55., 55., 55., 55., 55., 55., 55., 55., 55., 55., 55., 55., 55.],
		[55., 55., 55., 55., 55., 55., 55., 55., 55., 55., 55., 55., 55., 55., 55.]
	]);


	// マップの歩ける場所を決める
	// 1 なら歩けないし、 0 なら歩ける
	map.cmap = [
		[0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
		[0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
		[0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
		[0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
		[0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
		[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
		[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
		[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
	];
	

	Hack.maps[mapName] = map;

}


game.on('load', gameStartLazy);
Hack.on('load', createMap);
