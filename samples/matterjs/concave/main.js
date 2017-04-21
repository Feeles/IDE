import {
	Engine,
	Render,
	Runner,
	Composites,
	Common,
	MouseConstraint,
	Mouse,
	World,
	Vertices,
	Bodies,
} from 'matter';


import engine from 'engine';
const world = engine.world;

import render from 'render';
Render.run(render);

const runner = Runner.create();
Runner.run(runner, engine);


World.add(world, [
	// 壁
	Bodies.rectangle(400, 0, 800, 50, {
		isStatic: true
	}),
	Bodies.rectangle(400, 600, 800, 50, {
		isStatic: true
	}),
	Bodies.rectangle(800, 300, 50, 600, {
		isStatic: true
	}),
	Bodies.rectangle(0, 300, 50, 600, {
		isStatic: true
	})
]);

// ベクトルデータ
const arrow = Vertices.fromPath('40 0 40 20 100 20 100 80 40 80 40 100 0 50');
const chevron = Vertices.fromPath('100 0 75 50 100 100 25 100 0 50 25 0');
const star = Vertices.fromPath('50 0 63 38 100 38 69 59 82 100 50 75 18 100 31 59 0 38 37 38');
const horseShoe = Vertices.fromPath('35 7 19 17 14 38 14 58 25 79 45 85 65 84 65 66 46 67 34 59 30 44 33 29 45 23 66 23 66 7 53 7');

// ベクトルデータからオブジェクトを作って、 24 個のスタックにする
const stack = Composites.stack(50, 50, 6, 4, 10, 10, function(x, y) {
	const color = Common.choose(['#556270', '#4ECDC4', '#C7F464', '#FF6B6B', '#C44D58']);
	return Bodies.fromVertices(x, y, Common.choose([arrow, chevron, star, horseShoe]), {
		render: {
			fillStyle: color,
			strokeStyle: color,
			lineWidth: 1
		}
	}, true);
});

World.add(world, stack);

// マウス操作
const mouse = Mouse.create(render.canvas);
const mouseConstraint = MouseConstraint.create(engine, {
	mouse: mouse,
	constraint: {
		stiffness: 0.2,
		render: {
			visible: false
		}
	}
});

World.add(world, mouseConstraint);

// keep the mouse in sync with rendering
render.mouse = mouse;


feeles.openReadme('concave/README.md');
