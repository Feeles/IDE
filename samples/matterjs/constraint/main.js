import {
	World,
	Bodies,
	Constraint,
} from 'matter';

import {
	world,
} from './setting';


// オブジェクトをつくる
const square1 = Bodies.rectangle(200, 100, 100, 100);

// オブジェクトを空中に固定するバネ
const spring1 = Constraint.create({
	// 固定するオブジェクト
	bodyA: square1,
	// 固定する位置
	pointB: {　　
		x: 400,
		y: 100,
	},
	// バネの強さ
	stiffness: 0.001,
});

World.add(world, [
	// オブジェクト
	square1,
	// バネ
	spring1,
	
]);



