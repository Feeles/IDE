import Minecraft from 'minecraft/core';

const mc = new Minecraft();

mc.agent.tp();
mc.setTime(0);

mc.utils.setInterval(async() => {


	/*+ エージェント*/


}, 500);


mc.player.on(('▼ プレイヤーが', 'うごいた'), () => {


	/*+ アクション */


});


mc.blocks[('▼ ブロック', 'cactus' /*サボテン*/ )].onおかれた = () => {


	/*+ アクション */

};

/*+ イベント */



/*+ くみあわせ */
