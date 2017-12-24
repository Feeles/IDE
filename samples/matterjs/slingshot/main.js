import {
	Composites,
	Events,
	Constraint,
	World,
	Bodies,
} from 'matter';

import {
	engine,
	world,
	mouseConstraint,
} from './setting';


// 岩のオブジェクトをつくる
const rock = Bodies.polygon(170, 450, 8, 20, {
	// おもさ
	density: 0.01,
	
});

// 岩とアンカー地点をバネでつなぐ
const elastic = Constraint.create({
	pointA: {
		x: 170,
		y: 450
	},
	bodyB: rock,
	stiffness: 0.08,
	
});


World.add(world, [
	// 岩のオブジェクト
	rock,
	// バネ
	elastic,
	
]);


Events.on(engine, 'afterUpdate', () => {
	// 毎フレームここに入る
	
	// 現在の岩のオブジェクト
	const current = elastic.bodyB;
	
	if (mouseConstraint.mouse.button === -1 && (current.position.x > 190 || current.position.y < 430)) {
		// 画面の中でマウスが離されたとき、ここに入る
		
		// 次の岩のオブジェクトを作る
		const nextRock = Bodies.polygon(170, 450, 7, 20, {
			// おもさ
			density: 0.01,
			
		});
		World.add(world, nextRock);
		
		// 岩のオブジェクトをバネにつける
		elastic.bodyB = nextRock;
	}
	
});


import './stage';
