import {
	Composites,
	Constraint,
	World,
	Bodies,
} from 'matter';

import {
	world,
} from './setting';


// 台をつくる
const catapult = Bodies.rectangle(400, 520, 320, 20);

World.add(world, [
	// 台のオブジェクト
	catapult,

	// 台を固定するバネ 1
	Constraint.create({
		// 固定するオブジェクト
		bodyA: catapult,
		// 固定するポイント
		pointB: {
			x: 390,
			y: 580
		},

	}),

	// 台を固定するバネ 2
	Constraint.create({
		// 固定するオブジェクト
		bodyA: catapult,
		// 固定するポイント
		pointB: {
			x: 410,
			y: 580
		},

	}),

	// 左下にあるストッパー
	Bodies.rectangle(250, 555, 20, 50, {
		// 固定する
		isStatic: true,

	}),

	// 落ちてくる大きな円
	Bodies.circle(560, 100, 50, {
		// おもさ
		density: 0.0000000005,

	}),

]);



import './stage';
