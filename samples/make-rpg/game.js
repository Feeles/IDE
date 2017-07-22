import 'hackforplay/core';
// import 'mod/3d/core';

async function gameFunc() {

	Hack.changeMap('map1'); // map1 をロード

	self.player = new Player(); // プレイヤーをつくる
	player.mod(('▼ スキン', _kきし)); // 見た目
	player.locate(3, 5); // はじめの位置
	player.on('たおれたとき', () => {
		player.destroy(); // プレイヤーを消す
		Hack.gameover(); // ゲームオーバー
	});
	/*+ スキル */
	


	/*+ ゲーム */

}

export default gameFunc;





/* こまかいゲームシステムを作ろう (アップデート関数) */
Core.instance.on('enterframe', async() => {

	/*+ 入力 */

});
