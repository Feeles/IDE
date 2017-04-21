import {
	World,
	Bodies,
} from 'matter';

import {
	world,
} from './setting.js';

World.add(world, [
	
	// 左のオブジェクト
	Bodies.rectangle(200, 500, 10, 500, {
		// かたむき
		angle: 0.2,
		
	}),
	
	// 右のオブジェクト
	Bodies.rectangle(350, 450, 10, 700, {
		// かたむき
		angle: 2.36,
		
	}),
	
]);


import './stage.js';
