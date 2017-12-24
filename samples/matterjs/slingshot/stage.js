import {
	Composites,
	World,
	Bodies,
} from 'matter';


import {
	world,
} from './setting';


World.add(world, [
	// 床のオブジェクト
	Bodies.rectangle(395, 600, 815, 50, {
		isStatic: true,
	}),

	// 上の床のオブジェクト
	Bodies.rectangle(610, 250, 200, 20, {
		isStatic: true
	}),

	// 上のピラミッド
	Composites.pyramid(550, 0, 5, 10, 0, 0, (x, y) => {
		return Bodies.rectangle(x, y, 25, 40);
	}),

	//　下のピラミッド
	Composites.pyramid(500, 350, 9, 10, 0, 0, (x, y) => {
		return Bodies.rectangle(x, y, 25, 40);
	}),

]);
