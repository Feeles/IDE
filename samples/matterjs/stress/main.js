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
const stack = Composites.stack(90, 50, 18, 15, 0, 0, (x, y) => {
	return Bodies.rectangle(x, y, 35, 35);
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


feeles.openReadme('stress/README.md');
