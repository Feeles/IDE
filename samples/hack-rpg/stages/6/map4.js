import Assets from 'hackforplay/Assets';
import {
	gameclear
} from 'utils';
import extra from '../extra';



function gameStartLazy() {

	// しろ
	const item1 = new RPGObject();
	item1.mod(Hack.assets.castle);
	// 城の透明度（うすさ）を 0 にする（見えなくする）
	item1.opacity = 0;
	// 城を 13, 5 の位置に移動する ( map4 )
	item1.locate(13, 5, 'map4');
	// 城にプレイヤーが乗ったら...
	item1.onplayerenter = () => {
		// 城を削除する
		item1.destroy();
		// ゲームクリアー！！！！！！
		gameclear();
	};


	// ゲームクリアのコード　（　関数 )
	function gameclear() {

		// 画面を暗くする
		const dark = Hack.overlay('rgb(0,0,0,1)');
		dark.opacity = 0;
		game.rootScene.addChild(dark);
		dark.tl.delay(30).then(function() {
			Hack.menuGroup.parentNode.removeChild(Hack.menuGroup);
		}).fadeIn(90, enchant.Easing.CUBIC_EASEOUT).then(function() {

			// ALL CLEAR と表示する
			const label = new Label('ALL CLEAR');
			label.width = 480;
			label.moveTo(0, 100);
			label.color = 'white';
			label.textAlign = 'center';
			label.opacity = 0;
			label.tl.fadeIn(20);
			game.rootScene.addChild(label);

			// ハートを表示する
			const treasure = new Sprite(32, 32);
			treasure.image = game.assets['enchantjs/x2/map1.gif'];
			treasure.moveTo(224, 150);
			treasure.frame = 563;
			treasure.opacity = 0;
			treasure.tl.delay(40).fadeIn(20).then(() => {
				// 最後の説明書を表示する
				feeles.openReadme('THANKS.md');
			});
			game.rootScene.addChild(treasure);

		});

	}

	// このステージを改造
	extra(13, 7, 'map4', 'stages/6/map4.js');
}



function createMap() {

	// map4 というマップを作る
	const mapName = 'map4';

	// 15, 10 の大きさにする ( 32 の部分は書き換えないでください )
	const map = new RPGMap(32, 32, 15, 10);

	map.imagePath = 'enchantjs/x2/dotmat.gif';

	const ___ = -1;

	// マップの地形をつくる
	map.bmap.loadData([
		[205, 205, 205, 205, 205, 205, 205, 205, 205, 205, 205, 206, 322, 322, 322],
		[205, 205, 205, 205, 205, 205, 205, 205, 205, 205, 205, 206, 322, 322, 322],
		[205, 205, 205, 205, 205, 205, 205, 205, 205, 205, 205, 206, 322, 322, 322],
		[166, 225, 225, 225, 167, 205, 205, 205, 205, 205, 205, 206, 322, 322, 322],
		[206, 322, 322, 322, 224, 225, 225, 225, 225, 225, 225, 226, 322, 322, 322],
		[206, 322, 322, 322, 322, 322, 322, 322, 322, 322, 322, 322, 322, 322, 322],
		[206, 322, 322, 322, 184, 185, 185, 185, 185, 185, 185, 186, 322, 322, 322],
		[164, 185, 185, 185, 165, 205, 205, 205, 205, 205, 205, 206, 322, 322, 322],
		[205, 205, 205, 205, 205, 205, 205, 205, 205, 205, 205, 206, 322, 322, 322],
		[205, 205, 205, 205, 205, 205, 205, 205, 205, 205, 205, 206, 322, 322, 322]
	], [
		[___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, 461, 462, 461],
		[___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, 481, 482, 481],
		[___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, 421, 421, 461],
		[___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, 421, 421, 481],
		[___, 421, 421, 421, ___, ___, ___, ___, ___, ___, ___, ___, 421, 421, ___],
		[___, 421, ___, 421, 421, 421, 421, 421, 421, 421, 421, 421, 421, 421, ___],
		[___, 421, 421, 421, ___, ___, ___, ___, ___, ___, ___, ___, 421, 421, 461],
		[___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, 421, 421, 481],
		[___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, 461, 462, 461],
		[___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, ___, 481, 482, 481]
	]);


	// マップの歩ける場所を決める
	// 1 なら歩けないし、 0 なら歩ける
	map.cmap = [
		[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
		[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
		[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
		[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
		[1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
		[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
		[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
		[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
		[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0]
	];

	Hack.maps[mapName] = map;

}


game.on('load', gameStartLazy);
Hack.on('load', createMap);
