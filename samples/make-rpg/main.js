import Assets from 'hackforplay/Assets';
import './maps';
// import 'mod/3d/core';

function main() {
	// map1 をロード
	Hack.maps['map1'].load();

	// プレイヤー（騎士）をつくる
	const player = Hack.player = new Player();
	player.mod(Hack.assets.knight);
	player.locate(3, 5);
	player.hp = 3;
	player.atk = 1;
	player.onbecomedead = function() {
		this.destroy();
		Hack.gameover();
	};

	/* ____/ assets/game.json \____ */



	/* \____ assets/game.json ____/ */

}

game.onload = main;
Hack.start();
