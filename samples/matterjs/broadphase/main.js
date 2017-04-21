import {
	Engine,
	Render,
	Runner,
	Composites,
	Common,
	MouseConstraint,
	Mouse,
	World,
	Bodies,
} from 'matter';


import engine from 'engine';
const world = engine.world;

import render from 'render';
render.options.showBroadphase = true;
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

// 中のオブジェクト
const stack = Composites.stack(20, 20, 12, 5, 0, 0, (x, y) => {
	switch (Math.round(Common.random(0, 1))) {

		case 0:
			if (Common.random() < 0.8) {
				return Bodies.rectangle(x, y, Common.random(20, 50), Common.random(20, 50));
			} else {
				return Bodies.rectangle(x, y, Common.random(80, 120), Common.random(20, 30));
			}
			break;
		case 1:
			return Bodies.polygon(x, y, Math.round(Common.random(1, 8)), Common.random(20, 50));

	}
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


feeles.openReadme('broadphase/README.md');
