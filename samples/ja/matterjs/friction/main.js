import {
	World,
	Bodies,
} from 'matter';

import {
	world,
} from './setting';


World.add(world, [

	// 上のオブジェクト
	Bodies.rectangle(300, 70, 40, 40, {
		// まさつ力
		friction: 0.001,
		
	}),
	
	// 中のオブジェクト
	Bodies.rectangle(300, 250, 40, 40, {
		// まさつ力
		friction: 0.0005,
		
	}),
	
	// 下のオブジェクト
	Bodies.rectangle(300, 430, 40, 40, {
		// まさつ力
		friction: 0,
		
	}),
	
]);


import './stage';
