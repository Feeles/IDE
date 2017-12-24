import {
	Composites,
	World,
	Bodies,
} from 'matter';

import {
	world,
} from './setting';


World.add(world, [
	// スタック
	Composites.stack(400, 179, 5, 10, 0, 0, (x, y) => {
		return Bodies.rectangle(x, y, 40, 40);
	}),
	
	// 壁のオブジェクト
	Bodies.rectangle(400, 0, 800, 50, {
		isStatic: true,
	}),
	Bodies.rectangle(400, 600, 800, 50, {
		isStatic: true,
	}),
	Bodies.rectangle(800, 300, 50, 600, {
		isStatic: true,
	}),
	Bodies.rectangle(0, 300, 50, 600, {
		isStatic: true,
	}),
	
]);
