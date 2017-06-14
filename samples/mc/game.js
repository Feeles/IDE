import 'hackforplay/core';
// import 'mod/3d/core';

import Minecraft from 'minecraft/core';


const minecraft = new Minecraft();
const mc = minecraft;



mc.player.onうごいた = () => {

	/* \____ assets/マイクラ.yml ____/ */

};

mc.player.onやられた = () => {

	/* \____ assets/マイクラ.yml ____/ */

};


mc.blocks['grass' /*_mcb*/ ].onこわれた = () => {

	/* \____ assets/マイクラ.yml ____/ */

};

mc.blocks['grass' /*_mcb*/ ].onおかれた = () => {

	/* \____ assets/マイクラ.yml ____/ */

};



/* \____ assets/マイクラ.yml ____/ */








export default function rpgGameFunc() {

	Hack.changeMap('map1'); // map1 をロード

	self.player = new Player(); // プレイヤーをつくる
	player.mod(_kきし); // 見た目
	player.locate(3, 5); // はじめの位置
	player.hp = 9999999999999; // 体力
	player.atk = 1; // こうげき力
	player.onたおれたとき = () => {
		player.destroy(); // プレイヤーを消す
		Hack.gameover(); // ゲームオーバー
	};

	/* \____ assets/ゲーム.yml ____/ */

}
