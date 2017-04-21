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

// create runner
const runner = Runner.create();
Runner.run(runner, engine);

// 床
World.add(world, [
	Bodies.rectangle(400, 600, 1200, 50.5, {
		isStatic: true
	})
]);

// 丸たち
const stack = Composites.stack(100, 0, 10, 8, 10, 10, (x, y) => {
	return Bodies.circle(x, y, Common.random(15, 30), {
		restitution: 0.6,
		friction: 0.1
	});
});

World.add(world, [
	stack,
	// 	三角形
	Bodies.polygon(200, 460, 3, 60),
	// 	五角形
	Bodies.polygon(400, 460, 5, 60),
	// 	正方形
	Bodies.rectangle(600, 460, 80, 80)
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


// 画面端から反対の端に移動するプラグインの設定
const allBodies = Composite.allBodies(world);

for (const body of allBodies) {
	body.plugin = {
		wrap: {
			min: {
				x: render.bounds.min.x - 100,
				y: render.bounds.min.y
			},
			max: {
				x: render.bounds.max.x + 100,
				y: render.bounds.max.y
			}
		}
	};
}


feeles.openReadme('ballPool/README.md');
