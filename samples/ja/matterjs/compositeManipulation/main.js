import {
	Engine,
	Render,
	Runner,
	Events,
	Composite,
	Composites,
	MouseConstraint,
	Mouse,
	World,
	Bodies,
} from 'matter';


import engine from 'engine';
const world = engine.world;
// 下方向への重力
world.gravity.y = 0;

import render from 'render';
render.options.showAngleIndicator = true;
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

// オブジェクトのスタック
const stack = Composites.stack(200, 200, 4, 4, 0, 0, (x, y) => {
	return Bodies.rectangle(x, y, 40, 40);
});

World.add(world, stack);

Events.on(engine, 'afterUpdate', (event) => {
	// 毎フレームここに入る
	const time = engine.timing.timestamp;

	Composite.translate(stack, {
		x: Math.sin(time * 0.001) * 2,
		y: 0
	});

	Composite.rotate(stack, Math.sin(time * 0.001) * 0.01, {
		x: 300,
		y: 300
	});

	const scale = 1 + (Math.sin(time * 0.001) * 0.01);

	Composite.scale(stack, scale, scale, {
		x: 300,
		y: 300
	});
});

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


feeles.openReadme('compositeManipulation/README.md');
