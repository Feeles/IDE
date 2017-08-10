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
		isStatic: true
	}),
	Bodies.rectangle(400, 600, 800, 50, {
		isStatic: true
	}),
	Bodies.rectangle(800, 300, 50, 600, {
		isStatic: true
	}),
	Bodies.rectangle(0, 300, 50, 600, {
		isStatic: true
	})
]);
