import {
	World,
	Bodies,
} from 'matter';

import {
	world,
} from './setting';

World.add(world, [
	// かべのオブジェクト
	Bodies.rectangle(400, 0, 800, 50, {
		isStatic: true,
	}),
	Bodies.rectangle(400, 600, 800, 80, {
		isStatic: true,
		angle: -0.05,
	}),
	Bodies.rectangle(800, 300, 50, 600, {
		isStatic: true,
	}),
	Bodies.rectangle(0, 300, 50, 600, {
		isStatic: true,
	}),
	
	// バーの下の土台
	Bodies.rectangle(450, 400, 520, 50, {
		isStatic: true,
		chamfer: true,
	}),
	Bodies.rectangle(180, 450, 150, 50, {
		isStatic: true,
		chamfer: true,
		angle: -1.2,
	}),
	
	// レーン
	Bodies.rectangle(270, 180, 350, 20, {
		isStatic: true,
		chamfer: true,
		angle: 0.5,
		friction: 0,
	}),
	Bodies.rectangle(130, 190, 20, 200, {
		isStatic: true,
		chamfer: true,
	}),
	
]);
