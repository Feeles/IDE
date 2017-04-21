import {
	Engine,
	Render,
	Runner,
	Composites,
	MouseConstraint,
	Mouse,
	World,
	Bodies,
} from 'matter';


import engine from 'engine';
const world = engine.world;

import render from 'render';
Render.run(render);

const runner = Runner.create();
Runner.run(runner, engine);


// オブジェクトのスタック
const stack = Composites.stack(100, 120, 25, 18, 0, 0, function(x, y) {
	return Bodies.rectangle(x, y, 25, 25);
});

World.add(world, [
	stack,
	// 壁のオブジェクト
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


feeles.openReadme('stress2/README.md');
