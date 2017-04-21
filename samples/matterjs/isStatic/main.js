import {
	World,
	Bodies,
} from 'matter';

import {
	world,
} from './setting';


World.add(world, [
		
	// ゆかのオブジェクト
	Bodies.rectangle(400, 400, 600, 10, {
		// 静止するフラグ
		isStatic: true,
		
	}),
	
	// かべのオブジェクト
	Bodies.rectangle(200, 300, 10, 400, {
		// 静止するフラグ
		isStatic: true,
		
	}),
	
	// 動くオブジェクト
	Bodies.rectangle(400, 200, 70, 70, {
		// 静止するフラグ　（元から false なので、書かなくてもいい）
		isStatic: false,
		
	}),

	
]);


import './stage';
