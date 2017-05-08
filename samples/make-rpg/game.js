import 'hackforplay/core';
// import 'mod/3d/core';

function gameFunc() {
	// map1 をロード
	Hack.maps['map1'].load();
	// プレイヤー（騎士）をつくる
	self.player = new Player();
	player.mod(Hack.assets.knight); // 見た目
	player.locate(3, 5); // はじめの位置
	player.hp = 3; // 体力
	player.onbecomedead = () => {
		player.destroy();
		Hack.gameover(); // プレイヤーがたおれた => ゲームオーバー
	};

	/* \____ assets/ゲーム.json ____/ */

}

export default gameFunc;
