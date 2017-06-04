import 'hackforplay/core';
// import 'mod/3d/core';

import Minecraft from 'minecraft/core';
import {
	drawImage
} from 'minecraft/utils';

const rr = (range) => {
	return Math.random() * range * 2 - range;
};


function gameFunc() {

	const minecraft = new Minecraft();
	const mc = minecraft;

	mc.execute('gamemode c');

	mc.setTime(0);

	mc.give('wool:3', 3);

	mc.say('wwwwwwwww');

	mc.blocks.stone.onこわれた = () => {

		mc.kill(name);

	};

	mc.player.onやられた = () => {
		Hack.gameover();
	};



	mc.blocks.dirt.onこわれた = () => {
		// mc.execute('xp 1000 @p');
		mc.xp(1000);
	};



	setInterval(() => {

		// mc.locateBy(rr(10), 0, rr(10));

	}, 5000);




	drawImage(mc, 'trimmed/bat');





	Hack.changeMap('map1'); // map1 をロード

	self.player = new Player(); // プレイヤーをつくる
	player.mod(_kきし); // 見た目
	player.locate(3, 5); // はじめの位置
	player.hp = 3; // 体力
	player.atk = 1; // こうげき力
	player.onたおれたとき = () => {
		player.destroy(); // プレイヤーを消す
		Hack.gameover(); // ゲームオーバー
	};

	/* \____ assets/ゲーム.json ____/ */

}

export default gameFunc;
