import Assets from 'hackforplay/Assets';
import {
	gameclear
} from 'utils';
import extra from '../extra';
import './maps';


function gameStart() {

	// map1 を読み込む
	Hack.changeMap('map1');

	// 解説の youtube を開く
	feeles.openMedia({
		url: 'https://www.youtube.com/embed/mLBb7WQTjoo'
	});

	// 説明書を表示する
	// feeles.openReadme('stages/2/README.md');

	// プレイヤー（騎士）
	const player = Hack.player = new Player();
	player.mod(('▼ スキン', _kきし));
	// プレイヤーを 3, 5 の位置に移動する
	player.locate(3, 5);
	// プレイヤーの体力
	player.hp = 3;
	// プレイヤーの攻撃力
	player.atk = 1;
	// プレイヤーがやられたら...
	player.onたおれたとき = function() {
		// プレイヤーを削除
		this.destroy();
		// ゲームオーバー
		Hack.gameover();
	};

	// 魔道書にプレイヤーを登録する
	feeles.setAlias('player', player);


	/*+ ゲーム */


	// まどうしょ
	const item1 = new RPGObject();
	item1.mod(('▼ スキン', _m魔道書));
	// 魔道書を 5, 3 の位置に移動する
	item1.locate(5, 3);
	// 魔道書にプレイヤーが乗ったら...
	item1.onのった = () => {
		// 説明書 2 を開く
		// feeles.openReadme('stages/2/README2.md');
		// 魔道書を開く
		feeles.openCode('stages/2/code.js');
		// 魔道書を削除
		item1.destroy();
	};


	// スライム
	const item2 = new RPGObject();
	item2.mod(('▼ スキン', _sスライム));
	// スライムの体力
	item2.hp = 99;
	// スライムを 7, 5 の位置に移動する ( map1 )
	item2.locate(7, 5, 'map1');

	// 魔道書にスライムを登録する
	feeles.setAlias('slime', item2);

	// イモムシ
	const item3 = new RPGObject();
	item3.mod(('▼ スキン', _iいもむし));
	// イモムシの体力
	item3.hp = 9999;
	// イモムシを 5, 7 の位置に移動する ( map1 )
	item3.locate(5, 7, 'map1');

	// 魔道書にスライムを登録する
	feeles.setAlias('insect', item3);

	// かいだん
	const item4 = new RPGObject();
	item4.mod(('▼ スキン', _kくだりかいだん));
	// 階段を 7, 9 の位置に移動する ( map1 )
	item4.locate(7, 9, 'map1');
	// 階段は下の方に配置する ( Under )
	item4.layer = RPGMap.Layer.Under;
	// 階段にプレイヤーが乗ったら...
	item4.onのった = () => {
		// 次のステージに！
		gameclear('stages/3/index.html');
	};

	// まほうをすすめてくる女の人
	const item5 = new RPGObject();
	item5.opacity = 0;
	item5.mod(('▼ スキン', _o女の人));
	// 女の人を 4, 3 の位置に移動する ( map1 )
	item5.locate(4, 3, 'map1');
	// 女の人にプレイヤーがぶつかったら...
	item5.onぶつかった = () => {
		if (item1.parentNode) {
			// まだひろってないなら、魔道書を開く
			feeles.openCode('stages/2/code.js');
			// 魔道書を削除
			item1.destroy();
		}
		Hack.log('本に かかれている もじを よんでみて');
	};
	// 魔道書に女の人を登録する
	feeles.setAlias('woman', item5);

	// まどうしょがやってくるぞ…
	item2.onこうげきされた = () => {
		// 魔道書: 60f まつ -> 下に32 ずれる -> 45f まつ -> 下に32 ずれる
		item1.tl
			.delay(60).moveBy(0, 32, 30)
			.delay(45).moveBy(0, 32, 30);
		// 女の人: 210f まつ -> じわじわあらわれる -> あるく
		item5.tl
			.delay(210).fadeIn(30)
			.then(() => {
				item5.walk();
			});
		// 一回だけ
		item2.onこうげきされた = null;
	};

	// このステージを改造
	extra(5, 1, 'map1', 'stages/2/main.js');
}


game.onload = gameStart;

Hack.start();
