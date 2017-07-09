import Minecraft from 'minecraft/core';

const mc = new Minecraft();

// マイクラ世界のじかんをリセットする
mc.setTime(0);

// いちどだけ、うごかす
feeles.setTimeout(() => {


	/*+ アクション */


}, 1000);

// プレイヤーがうごいたとき、うごかす
mc.player.on(('▼ プレイヤーが', 'うごいた'), () => {


	/*+ アクション */


});

// エージェントを自分のところにテレポートさせる
mc.agent.tp();

// エージェントをくり返しうごかす
mc.utils.setInterval(async() => {


	/*+ エージェント*/

}, 500);



/*+ イベント */


/*+ くみあわせ */
