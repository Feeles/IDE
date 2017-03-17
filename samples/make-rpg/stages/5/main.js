import Assets from 'hackforplay/Assets';
import './map2';
import extra from '../extra';

function gameStart() {

	// 説明書を開く
	feeles.openReadme('stages/5/README.md');
	
	// 魔道書を開く
	feeles.openCode('stages/5/code1.js');

	// 解説の youtube を開く
	feeles.openMedia({
		url: 'https://www.youtube.com/embed/3pfSkOBRvDI'
	});


	// map1 を読み込む
	Hack.maps['map1'].load();


	// プレイヤー（騎士）
	const player = Hack.player = new Player();
	player.mod(Hack.assets.knight);
	// プレイヤーを　7, 2 の位置に移動する
	player.locate(7, 2);
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
	feeles.exports.push({ player });



	// ATK Label
	// 攻撃力を画面に表示する
	var atkLabel = new ScoreLabel();
	// 攻撃力を表示するときの名称
	atkLabel.label = 'ATK:';
	// 攻撃力を表示する位置
	atkLabel.moveTo(Hack.menuGroup.x + 10, Hack.menuGroup.y + 104);
	atkLabel.onenterframe = function() {
		atkLabel.score = Hack.player.atk;
	};
	Hack.menuGroup.addChild(atkLabel);
	


	// コウモリ
	const item4 = new RPGObject();
	item4.mod(Hack.assets.bat);
	// コウモリを 11, 5 の位置に移動する ( map1 )
	item4.locate(11, 5, 'map1');
	//　コウモリを更新する...
	item4.onenterframe = () => {
		// コウモリの縦の位置をプレイヤーと同じにする
		item4.y = Hack.player.y;
	};


	// かいだん
	const item2 = new RPGObject();
	item2.mod(Hack.assets.upStair);
	// 階段を 7, 8 の位置に移動する ( map1 )
	item2.locate(7, 8, 'map1');
	// 階段を下の方に置く ( Under ) 
	item2.layer = RPGMap.Layer.Under;
	// 階段にプレイヤーが乗ったら...
	item2.onplayerenter = () => {
		// 説明書 2 を開く
		feeles.openReadme('stages/5/README2.md');
		// 魔道書の 2 ページ目をを開く
		feeles.openCode('stages/5/code2.js');
		// マップ map2 に移動する
		Hack.changeMap('map2');
		// プレイヤーを 7, 1 の位置に配置する ( map2 )
		Hack.player.locate(7, 1, 'map2');
	};

	// 赤スライム軍団
	
	// 0 ならスライムは出ないけど、
	// 1 ならスライムが出る！
	// ためしに数値を書き換えてみよう！
	[
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0],
		[0, 0, 0, 0, 1, 1, 1, 0, 1, 1, 1, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0]

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
			// スライムの色を red (赤色) にする
			item3.color = 'red';
			// スライムを　x, y の位置に配置する ( map1 )
			item3.locate(x, y, 'map1');
			// スライムが倒されたら...
			item3.onbecomedead = () => {
				// スコアアップ！
				Hack.score++;
			};

			// 魔道書にスライムを登録
			feeles.exports.push({
				[`slime${n}`]: item3
			});

		});
	});
	
	// このステージを改造
	extra(0, 5, 'map1', 'stages/5/main.js');
}


function createMap() {

	//　map1 というマップを作る
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
		[___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, 402],
		[___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___],
		[321, 321, 321, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, 321, 321],
		[321, 321, 321, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, 321, 321],
		[341, 341, 341, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, 341, 341]
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
		[1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
		[1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
		[1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1]
	];

	Hack.maps[mapName] = map;

}




game.onload = gameStart;
Hack.on('load', createMap);

Hack.start();