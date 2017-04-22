import 'hackforplay/core';
// import 'mod/3d/core';

function gameFunc() {
	// map1 をロード
	Hack.maps['map1'].load();
	// プレイヤー（騎士）をつくる
	Hack.player = new Player();
	Hack.player.mod(Hack.assets.knight);
	Hack.player.locate(3, 5);
	Hack.player.hp = 3;
	Hack.player.onbecomedead = () => {
		Hack.player.destroy();
		Hack.gameover();
	};

	/* \____ assets/ゲーム.json ____/ */

}

export default gameFunc;
