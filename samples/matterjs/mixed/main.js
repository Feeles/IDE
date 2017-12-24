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
render.options.showAngleIndicator = true;
Render.run(render);

const runner = Runner.create();
Runner.run(runner, engine);


// 中のオブジェクトのスタック
const stack = Composites.stack(20, 20, 10, 5, 0, 0, (x, y) => {
	const _sides = Math.round(Common.random(1, 8));

	// 3 だと良くないので、代わりに 4 にする
	const sides = (_sides === 3) ? 4 : _sides;

	// たまに角を丸くする
	const chamfer = sides > 2 && Common.random() > 0.7 ? {
		radius: 10
	} : null;

	// ランダムの確率
	const rate = Common.random(0, 1);
	if (rate < 0.1) {
		// 10% の確率で、ここに入る
		return Bodies.rectangle(x, y, Common.random(80, 120), Common.random(25, 30), {
			chamfer: chamfer
		});
	} else if (rate < 0.5) {
		// のこり 40% の確率で、ここに入る
		return Bodies.rectangle(x, y, Common.random(25, 50), Common.random(25, 50), {
			chamfer: chamfer
		});
	} else {
		// のこりの確率で、ここに入る
		return Bodies.polygon(x, y, sides, Common.random(25, 50), {
			chamfer: chamfer
		});
	}

});

World.add(world, stack);

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


feeles.openReadme('mixed/README.md');
