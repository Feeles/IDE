import {
	use,
	Engine,
	Render,
	Runner,
	Composite,
	Composites,
	Common,
	MouseConstraint,
	Mouse,
	World,
	Bodies,
} from 'matter';

import 'plugins/wrapPlugin';

use(
	'matter-wrap'
);


import engine from 'engine';
const world = engine.world;

import render from 'render';
Render.run(render);

const runner = Runner.create();
Runner.run(runner, engine);


// 転がっているボール
const stack = Composites.stack(20, 20, 20, 5, 0, 0, (x, y)　 => {
	return Bodies.circle(x, y, Common.random(10, 20), {
		friction: 0.00001,
		restitution: 0.5,
		density: 0.001
	});
});

World.add(world, stack);

World.add(world, [
	// 坂道
	Bodies.rectangle(200, 150, 700, 20, {
		isStatic: true,
		angle: Math.PI * 0.06
	}),
	Bodies.rectangle(500, 350, 700, 20, {
		isStatic: true,
		angle: -Math.PI * 0.06
	}),
	Bodies.rectangle(340, 580, 700, 20, {
		isStatic: true,
		angle: Math.PI * 0.04
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

render.mouse = mouse;


// 画面端から反対の端へ移動するプラグインの設定
for (const body of stack.bodies) {
	body.plugin = body.plugin || {};
	body.plugin.wrap = {
		min: {
			x: render.bounds.min.x,
			y: render.bounds.min.y
		},
		max: {
			x: render.bounds.max.x,
			y: render.bounds.max.y
		}
	};
}


feeles.openReadme('avalanche/README.md');
