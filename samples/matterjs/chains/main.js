import {
	Body,
	Composite,
	Composites,
	Constraint,
	World,
	Bodies,
} from 'matter';

import {
	world,
} from './setting';


// ロープの中のオブジェクト同士がぶつからないようにするためのグループ
const ropeGroup = Body.nextGroup(true);

// ロープのオブジェクトのスタック
const ropeA = Composites.stack(400, 100, 1, 8, 0, 10, (x, y) => {
	return Bodies.rectangle(x, y, 20, 50, {
		collisionFilter: {
			group: ropeGroup,
		},
		
	});
});
World.add(world, ropeA);

// ロープをチェーンでつなぐ
Composites.chain(ropeA, 0, 0.5, 0, -0.5, {
	stiffness: 0.8,
	
});

// 左のロープを空中に固定する
Composite.add(ropeA, Constraint.create({
	bodyB: ropeA.bodies[0],
	pointB: {
		x: 0,
		y: -25
	},
	pointA: {
		x: 400,
		y: 100
	},
	stiffness: 0.5,
}));

