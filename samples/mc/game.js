import Minecraft from 'minecraft/core';

const mc = new Minecraft();

mc.player.on(('▼ プレイヤーが', 'うごいた'), () => {

	// １歩あるくたびに、出てくる
	mc.setBlock(('▼ しぜん', '赤のチューリップ'), 0, 0, 0);


	/*+ アクション */


});


/*+ ついかする */


// マイクラ世界のじかんをリセットする
mc.setTime(0);

// エージェントを自分のところにテレポートさせる
mc.agent.tp();
