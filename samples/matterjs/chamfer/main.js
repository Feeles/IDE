import {
	World,
	Bodies,
} from 'matter';

import {
	world,
} from './setting.js';

World.add(world, [
	
	// 左のオブジェクト
	Bodies.rectangle(200, 400, 200, 200, {
		// 角を丸くする
		chamfer: true,
		
	}),
	
	// 中のオブジェクト
	Bodies.rectangle(400, 100, 150, 150, {
		// 丸みの大きさをかえる
		chamfer: {
			radius: 2,
		},
		
	}),
	
	// 右のオブジェクト
	Bodies.rectangle(550, 300, 300, 300, {
		// 丸みの大きさをかえる
		chamfer: {
			radius: 40,
		},
		
	}),
	
]);


import './stage.js';
