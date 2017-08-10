import {
	World,
	Bodies,
} from 'matter';

import {
	world,
} from './setting';


World.add(world, [
	// 	壁
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
	
	// 	坂道
	Bodies.rectangle(200, 150, 400, 20, {
		isStatic: true,
		angle: Math.PI * 0.06,
	}),
	Bodies.rectangle(550, 350, 650, 20, {
		isStatic: true,
		angle: -Math.PI * 0.06,
	}),
	Bodies.rectangle(300, 560, 600, 20, {
		isStatic: true,
		angle: Math.PI * 0.04,
	}),
	
]);
