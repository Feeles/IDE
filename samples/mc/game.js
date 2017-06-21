import Minecraft from 'minecraft/core';

const mc = new Minecraft();

mc.setTime(0);

mc.player.on(('▼ プレイヤーが', 'うごいた'), () => {


	// クリエティブモードにする
	mc.gamemode('c');

	/*+ アクション */


});

mc.utils.setInterval(async() => {


	/*+ エージェント*/

}, 500);



/*+ イベント */


/*+ くみあわせ */
