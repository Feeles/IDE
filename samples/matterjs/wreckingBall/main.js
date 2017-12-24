import {
	World,
	Constraint,
	Bodies,
} from 'matter';

import {
	world,
} from './setting';


// 重い球
const ball1 = Bodies.circle(100, 400, 50, {
	// おもさ
	density: 0.04,
	// 空気ていこう
	frictionAir: 0.005,
	
});

// 重い球と空中のある点をつなぐ
const joint1 = Constraint.create({
	// 固定したいオブジェクト
	bodyA: ball1,
	// 固定したい点
	pointB: {
		x: 300,
		y: 100
	},
	// バネの強さ
	stiffness: 1.0,
	
});

World.add(world, [
	// 重い球
	ball1,
	// ジョイント
	joint1,
	
]);




import './stage';
