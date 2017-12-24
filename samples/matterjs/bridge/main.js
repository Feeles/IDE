import {
	Body,
	Composites,
	Constraint,
	World,
	Bodies,
} from 'matter';

import {
	world,
} from './setting';


// 橋の中のオブジェクト同士がぶつからないようにするためのグループ
const group1 = Body.nextGroup(true);

// 橋のオブジェクトのスタック
const bridge = Composites.stack(150, 300, 9, 1, 10, 10, (x, y) => {
	return Bodies.rectangle(x, y, 50, 20, {
		collisionFilter: {
			group: group1,
		},
		
	});
});

// 橋のオブジェクトをチェーンでつなぐ
Composites.chain(bridge, 0.5, 0, -0.5, 0, {
	// バネの強さ
	stiffness: 0.9,
	
});



World.add(world, [
	// 橋のスタック
	bridge,
	
	// 	左側を固定する
	Constraint.create({
		// 固定する点
		pointA: {
			x: 140,
			y: 300
		},
		// 橋の一番左のオブジェクト
		bodyB: bridge.bodies[0],
		// オブジェクトの左端を固定
		pointB: {
			x: -25,
			y: 0
		},
		
	}),
	
	// 	右側を固定する
	Constraint.create({
		// 固定する点
		pointA: {
			x: 660,
			y: 300
		},
		// 橋の一番右のオブジェクト
		bodyB: bridge.bodies[8],
		// オブジェクトの右端を固定
		pointB: {
			x: 25,
			y: 0
		},
		
	}),
	
]);



import './stage';
