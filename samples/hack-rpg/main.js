import Assets from 'hackforplay/Assets';

// import 'mod/3d/core';

function main() {


	// map1
	Hack.maps['map1'].load();


	// minotaur
	var item = new RPGObject();
	item.mod(Hack.assets.minotaur);
	item.hp = 10;
	item.atk = 1;
	item.locate(7, 5, 'map1');
	item.scale(2, 2);
	item.onbecomeidle = () => {
		item.attack();
	};





	// プレイヤー（騎士）
	var player = Hack.player = new Player();
	player.mod(Hack.assets.knight);
	player.locate(3, 5);
	player.hp = 3;
	player.atk = 1;
	player.onbecomedead = function() {
		this.destroy();
		Hack.gameover();
	};
	player.tag = 'player';

	
	
	
}

game.onload = main;
Hack.start();
