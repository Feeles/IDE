import 'hackforplay/core';
// import 'mod/3d/core';

function gameFunc() {
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

	/*+ ゲーム */

}

export default gameFunc;
