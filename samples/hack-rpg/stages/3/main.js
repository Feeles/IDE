import Assets from 'hackforplay/Assets';
import {
	gameclear
} from 'utils.js';
import extra from '../extra';

function gameStart() {

	// 魔道書を使う
	feeles.openCode('stages/3/code.js');

	// 解説の youtube を開く
	feeles.openMedia({
		url: 'https://www.youtube.com/embed/no7ch0jTHRc'
	});

	// 説明書を表示する
	feeles.openReadme('stages/3/README.md');

	// map1 を読み込む
	Hack.maps['map1'].load();


	// プレイヤー（騎士）
	const player = Hack.player = new Player();
	player.mod(Hack.assets.knight);
	// プレイヤーを　7, 1 の位置に移動する
	player.locate(7, 1);
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

	// かいだん
	const item1 = new RPGObject();
	item1.mod(Hack.assets.downStair);
	// 階段を 14, 6 の位置に移動する ( map1 )
	item1.locate(14, 6, 'map1');
	// 階段の透明度（うすさ）を 0 にする（見えなくする）
	item1.opacity = 0;
	// 階段は下の方に置く ( Under )
	item1.layer = RPGMap.Layer.Under;
	// 階段にプレイヤーが乗ったら...
	item1.onplayerenter = () => {
		// 次のステージに！
		gameclear('stages/4/index.html');
	};

	// 魔道書に階段を登録する
	feeles.setAlias('stair', item1);

	// このステージを改造
	extra(7, 0, 'map1', 'stages/3/main.js');
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
		[205, 205, 205, 205, 205, 205, 321, 321, 321, 205, 205, 205, 205, 205, 205],
		[205, 205, 205, 205, 205, 205, 321, 321, 321, 205, 205, 205, 205, 205, 205],
		[205, 205, 205, 205, 205, 205, 321, 321, 321, 205, 205, 205, 205, 205, 205],
		[205, 205, 205, 205, 205, 205, 341, 321, 341, 205, 205, 205, 205, 205, 205],
		[321, 321, 321, 205, 205, 205, 205, 321, 205, 205, 205, 205, 321, 321, 321],
		[321, 321, 321, 321, 321, 321, 321, 321, 321, 321, 321, 321, 321, 321, 321],
		[321, 321, 321, 341, 341, 341, 341, 321, 341, 341, 341, 341, 321, 321, 321],
		[341, 341, 341, 205, 205, 205, 205, 321, 205, 205, 205, 205, 341, 341, 341],
		[205, 205, 205, 205, 205, 205, 321, 321, 321, 205, 205, 205, 205, 205, 205],
		[205, 205, 205, 205, 205, 205, 321, 321, 321, 205, 205, 205, 205, 205, 205]
		]);


	// マップの歩ける場所を決める
	// 1 なら歩けないし、 0 なら歩ける
	map.cmap = [
		[1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1],
		[1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1],
		[1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1],
		[1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1],
		[0, 0, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 0, 0],
		[1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1],
		[1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1],
		[1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1]
	];


	Hack.maps[mapName] = map;

}




game.onload = gameStart;
Hack.on('load', createMap);


Hack.start();
