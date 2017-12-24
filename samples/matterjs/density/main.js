import {
	World,
	Bodies,
} from 'matter';

import {
	world,
} from './setting.js';


World.add(world, [
	
	// かるいオブジェクト
	Bodies.rectangle(300, 430, 30, 500, {
		// みつ度（おもさ）
		density: 100,
		// 少しだけ傾ける
		angle: 0.1,
		
	}),
	
	// おもいオブジェクト
	Bodies.rectangle(400, 430, 30, 500, {
		// みつ度（おもさ）
		density: 15,
		
	}),
	
]);


import './stage.js';
