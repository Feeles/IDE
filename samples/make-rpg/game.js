import 'hackforplay/core';
// import 'mod/3d/core';

import Random from 'hackforplay/random';
import Debug from 'hackforplay/debug';

console.clear();

async function gameFunc() {

	Hack.changeMap('map1'); // map1 をロード

	self.player = new Player(); // プレイヤーをつくる
	player.mod(('▼ スキン', _kきし)); // 見た目
	player.locate(3, 5); // はじめの位置
	player.hp = 3; // 体力
	player.atk = 1; // こうげき力
	player.on(('▼ イベント', 'たおれたとき'), () => {
		player.destroy(); // プレイヤーを消す
		Hack.gameover(); // ゲームオーバー
	});


	const player2 = new Player();
	player2.mod(('▼ スキン', _aあんこくきし)); // 見た目
	player2.locate(3, 5); // はじめの位置

	// キーボードを変える
	player2.input.left = 'a';
	player2.input.right = 'd';
	player2.input.up = 'w';
	player2.input.down = 's';
	player2.input.attack = 'f';

	// スピード 3 倍
	player2.speed = 3.0;

	// player2.stop();
	// player2.resume();


	// カメラ
	const camera1 = Camera.main;
	const camera2 = new Camera();

	camera2.target = player2;
	camera2.zoom(2);

	// カメラを横 2 、縦 1 のレイアウトで配置する
	Camera.layout(2, 1);



	// キーボード
	// Key.num0.on('press', () => {});
	// Key.ctrl.on('release', () => {});
	// if (Key.a.pressed)
	// if (Key.w.clicked)
	// Key.num1.observe(() => {});
	// TODO: キーのドロップダウンを作る


	// Hack.defaultParentNode.name = 'DefaultParentNode';


	Debug.children(game.rootScene);




	const item1 = new RPGObject();
	item1.mod(('▼ スキン', _o女の人));
	item1.locate(7, 5, 'map1');
	item1.on(('▼ イベント', 'ぶつかった'), () => {
		Hack.log('こんにちは。ここは 1F です');
	});

	const item2 = new RPGObject();
	item2.mod(('▼ スキン', _iいもむし));
	item2.hp = 2;
	item2.atk = 1;
	item2.locate(12, 5, 'map1');
	item2.on(('▼ イベント', 'とまるとき'), () => {
		item2.turn();
		item2.walk();
	});
	item2.on(('▼ イベント', 'たおれたとき'), () => {
		Hack.score += 1;
	});


	const camera3 = new Camera(100, 100, 100, 100);
	camera3.target = item1;
	camera3.borderStyle(4, 'red');
	camera3.zoom(0.5);


	for (let i = 10; i--;) {

		await player.walk(1, Random.dir4());
		await player.attack();

	}

	// RootScene のソートをチェック
	Debug.children(game.rootScene);


	/*+ ゲーム */

}

export default gameFunc;
