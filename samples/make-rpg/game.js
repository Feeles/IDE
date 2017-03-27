import 'hackforplay/core';
// import 'mod/3d/core';

function game() {
	// map1 をロード
	Hack.maps['map1'].load();

	// プレイヤー（騎士）をつくる
	const player = new Player();
	player.mod(Hack.assets.knight);
	player.locate(3, 5);
	player.hp = 3;
	player.atk = 1;
	player.onbecomedead = () => {
		player.destroy();
		Hack.gameover();
	};
	Hack.player = player;

	/* ____/ assets/ゲーム.json \____ */



	/* \____ assets/ゲーム.json ____/ */

}

export default game;
