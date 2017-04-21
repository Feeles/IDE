import {
	World,
	Bodies,
} from 'matter';

import {
	world,
} from './setting.js';

World.add(world, [
	// 左のオブジェクト
	Bodies.rectangle(200, 100, 60, 60, {
		// 空気ていこう
		frictionAir: 0.001,
		
	}),
	// 中のオブジェクト
	Bodies.rectangle(400, 100, 60, 60, {
		// 空気ていこう
		frictionAir: 0.05,
		
	}),
	// 右のオブジェクト
	Bodies.rectangle(600, 100, 60, 60, {
		// 空気ていこう
		frictionAir: 0.1,
		
	}),
	
]);


import './stage.js';
