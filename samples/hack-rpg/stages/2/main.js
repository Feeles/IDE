import Assets from 'hackforplay/Assets';
import {
	gameclear
} from 'utils';
import extra from '../extra';


function gameStart() {

	// 解説の youtube を開く
	feeles.openMedia({
		url: 'https://www.youtube.com/embed/mLBb7WQTjoo'
	});

	// 説明書を表示する
	feeles.openReadme('stages/2/README.md');

	// map1 を読み込む
	Hack.maps['map1'].load();


	// プレイヤー（騎士）
	const player = Hack.player = new Player();
	player.mod(Hack.assets.knight);
	// プレイヤーを 3, 5 の位置に移動する
	player.locate(3, 5);
	// プレイヤーの体力
	player.hp = 3;
	// プレイヤーの攻撃力
	player.atk = 1;
	// プレイヤーがやられたら...
	player.onbecomedead = function() {
		// プレイヤーを削除
		this.destroy();
		// ゲームオーバー
		Hack.gameover();
	};

	// 魔道書にプレイヤーを登録する
	feeles.setAlias('player', player);

	// まどうしょ
	const item1 = new RPGObject();
	item1.mod(Hack.assets.enchantBookItem);
	// 魔道書を 5, 3 の位置に移動する
	item1.locate(5, 3);
	// 魔道書にプレイヤーが乗ったら...
	item1.onplayerenter = () => {
		// 説明書 2 を開く
		feeles.openReadme('stages/2/README2.md');
		// 魔道書を開く
		feeles.openCode('stages/2/code.js');
		// 魔道書を削除
		item1.destroy();
	};


	// スライム
	const item2 = new RPGObject();
	item2.mod(Hack.assets.slime);
	// スライムの体力
	item2.hp = 99;
	// スライムを 7, 5 の位置に移動する ( map1 )
	item2.locate(7, 5, 'map1');

	// 魔道書にスライムを登録する
	feeles.setAlias('slime', item2);

	// イモムシ
	const item3 = new RPGObject();
	item3.mod(Hack.assets.insect);
	// イモムシの体力
	item3.hp = 9999;
	// イモムシを 5, 7 の位置に移動する ( map1 )
	item3.locate(5, 7, 'map1');

	// 魔道書にスライムを登録する
	feeles.setAlias('insect', item3);

	// かいだん
	const item4 = new RPGObject();
	item4.mod(Hack.assets.downStair);
	// 階段を 7, 9 の位置に移動する ( map1 )
	item4.locate(7, 9, 'map1');
	// 階段は下の方に配置する ( Under )
	item4.layer = RPGMap.Layer.Under;
	// 階段にプレイヤーが乗ったら...
	item4.onplayerenter = () => {
		// 次のステージに！
		gameclear('stages/3/index.html');
	};

	// このステージを改造
	extra(5, 1, 'map1', 'stages/2/main.js');
}


function createMap() {

	// map1 というマップを作る
	const mapName = 'map1';

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
		[320, 320, 320, 320, 320, 340, 320, 320, 401, 401, ___, 340, 340, 340, 320],
		[320, 320, 320, 320, 320, ___, 320, 320, 401, ___, ___, ___, ___, ___, 320],
		[320, 320, 320, 320, 320, ___, 320, 320, ___, ___, ___, 320, 320, ___, 320],
		[340, 340, 340, 320, 340, ___, 340, 320, 320, ___, 320, 320, 320, ___, 320],
		[___, ___, ___, 340, ___, ___, ___, 340, 340, ___, 320, 320, 320, ___, 320],
		[___, ___, ___, ___, ___, ___, ___, ___, ___, ___, 320, 320, 320, ___, 320],
		[___, ___, ___, 320, ___, ___, ___, 320, 320, 320, 320, 320, 320, ___, 320],
		[320, 320, 320, 320, 320, ___, 340, 340, 340, 340, 340, 340, 340, ___, 320],
		[320, 320, 320, 320, 320, ___, ___, ___, ___, ___, ___, ___, ___, ___, 320],
		[320, 320, 320, 320, 320, 320, ___, ___, ___, 320, 320, 320, 320, 320, 320]
	]);


	// マップの歩ける場所を決める
	// 1 なら歩けないし、 0 なら歩ける
	map.cmap = [
		[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1],
		[1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 0, 0, 0, 0, 1],
		[1, 1, 1, 1, 1, 0, 1, 1, 0, 0, 0, 1, 1, 0, 1],
		[1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1],
		[0, 0, 0, 1, 0, 0, 0, 1, 1, 0, 1, 1, 1, 0, 1],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 1],
		[0, 0, 0, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 1],
		[1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1],
		[1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
		[1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1]
	];



	Hack.maps[mapName] = map;

}




game.onload = gameStart;
Hack.on('load', createMap);


Hack.start();
