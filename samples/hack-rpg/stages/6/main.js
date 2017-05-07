import Assets from 'hackforplay/Assets';
import './map2';
import './map3';
import './map4';
import extra from '../extra';

game.preload('hackforplay/bar_green.png', 'hackforplay/bar_red.png');


function gameStart() {

	// 魔道書を開く
	feeles.openCode('stages/6/code1.js');

	// 解説の youtube を開く
	feeles.openMedia({
		url: 'https://www.youtube.com/embed/4L0qPyUaH0A'
	});

	// 説明書を開く
	// feeles.openReadme('stages/6/README.md');

	// map1 を読み込む
	Hack.maps['map1'].load();




	// プレイヤー（騎士）
	const player = Hack.player = new Player();
	player.mod(Hack.assets.knight);
	// プレイヤーを　7, 6 の位置に移動する
	player.locate(7, 6);
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

	// 	HP Gage
	// 体力のゲージを作る
	// 体力は最大で 9999
	const MAX = 9999;
	const bar = new Sprite(480, 32);
	bar.image = game.assets['hackforplay/bar_green.png'];
	// 体力ゲージの位置
	bar.moveTo(0, 288);
	// 体力ゲージを更新する...
	bar.onenterframe = function() {
		// プレイヤーの体力が、体力の最大値を超えないようにする
		Hack.player.hp = Math.min(Hack.player.hp, MAX);
		// 体力ゲージの長さを更新する
		bar.width = 480 * Hack.player.hp / MAX;
	};
	Hack.menuGroup.addChild(bar);


	// コウモリ
	const item1 = new RPGObject();
	item1.mod(Hack.assets.bat);
	// コウモリを 11, 5 の位置に移動する ( map1 )
	item1.locate(11, 5, 'map1');
	// コウモリを更新する...
	item1.onenterframe = () => {
		//　コウモリの横の位置をプレイヤーと同じにする
		item1.y = Hack.player.y;
	};

	// 魔道書にコウモリを登録する
	feeles.setAlias('bat', item1);

	// かいだん
	const item2 = new RPGObject();
	item2.mod(Hack.assets.upStair);
	// 階段を 14, 5　の位置に配置する ( map1 )
	item2.locate(14, 5, 'map1');
	// 階段を下の方に置く
	item2.layer = RPGMap.Layer.Under;
	// 階段にプレイヤーが乗ったら...
	item2.onplayerenter = () => {
		// 説明書 2 を開く
		// feeles.openReadme('stages/6/README2.md');
		// 魔道書の 2 ページ目を開く
		feeles.openCode('stages/6/code2.js');
		// マップ map2 に移動する
		Hack.changeMap('map2');
		// プレイヤーを 0, 5 の位置に移動する ( map2 )
		Hack.player.locate(0, 5, 'map2');
	};

	// このステージを改造
	extra(0, 5, 'map1', 'stages/6/main.js');
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
		[342, 342, 342, 342, 342, 342, 342, 342, 342, 342, 342, 342, 342, 342, 342],
		[342, 342, 342, 342, 342, 342, 342, 342, 342, 342, 342, 342, 342, 342, 342],
		[342, 342, 342, 342, 342, 342, 342, 342, 342, 342, 342, 342, 342, 342, 342],
		[342, 342, 342, 342, 342, 342, 342, 342, 342, 342, 342, 342, 342, 342, 342],
		[342, 342, 342, 342, 342, 342, 342, 342, 342, 342, 342, 342, 342, 342, 342],
		[342, 342, 342, 342, 342, 342, 342, 342, 342, 342, 342, 342, 342, 342, 342],
		[342, 342, 342, 342, 342, 342, 342, 342, 342, 342, 342, 342, 342, 342, 342],
		[342, 342, 342, 342, 342, 342, 342, 342, 342, 342, 342, 342, 342, 342, 342],
		[342, 342, 342, 342, 342, 342, 342, 342, 342, 342, 342, 342, 342, 342, 342],
		[342, 342, 342, 342, 342, 342, 342, 342, 342, 342, 342, 342, 342, 342, 342]
	], [
		[321, 321, 321, 341, 341, 341, ___, ___, ___, 341, 341, ___, ___, 321, 321],
		[321, 321, 321, ___, ___, ___, ___, 402, ___, ___, ___, ___, ___, 321, 321],
		[321, 321, 321, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, 321, 321],
		[341, 341, 341, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, 341, 341],
		[___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___],
		[___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___],
		[___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___],
		[321, 321, 321, ___, ___, ___, 321, 341, 321, ___, ___, ___, ___, 321, 321],
		[321, 321, 321, ___, ___, ___, 321, 402, 321, ___, ___, ___, ___, 321, 321],
		[341, 341, 341, 341, 341, 341, 341, 341, 341, 341, 341, ___, ___, 341, 341]
	]);

	// マップの歩ける場所を決める
	// 1 なら歩けないし、 0 なら歩ける
	map.cmap = [
		[1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 0, 0, 1, 1],
		[1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
		[1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
		[1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 1, 1],
		[1, 1, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1, 1],
		[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1]
	];

	Hack.maps[mapName] = map;

}




game.onload = gameStart;
Hack.on('load', createMap);

Hack.start();
