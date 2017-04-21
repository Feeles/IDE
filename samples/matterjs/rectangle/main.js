import {
	World,
	Bodies,
} from 'matter';

import {
	world,
} from './setting.js';

World.add(world, [
	
	// 左のオブジェクト
	Bodies.rectangle(150, 500, 100, 200),
	
	// 中のオブジェクト
	Bodies.rectangle(400, 400, 100, 300),
	
	// 右のオブジェクト
	Bodies.rectangle(500, 100, 400, 100),
	
]);


import './stage.js';
