import Minecraft from 'minecraft/core';

const mc = new Minecraft();

mc.setTime(0);

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
