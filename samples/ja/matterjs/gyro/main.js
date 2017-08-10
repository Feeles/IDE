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

	switch (Math.round(Common.random(0, 1))) {
		case 0:
			if (Common.random() < 0.8) {
				return Bodies.rectangle(x, y, Common.random(25, 50), Common.random(25, 50), {
					chamfer: chamfer
				});
			} else {
				return Bodies.rectangle(x, y, Common.random(80, 120), Common.random(25, 30), {
					chamfer: chamfer
				});
			}
			break;
		case 1:
			return Bodies.polygon(x, y, sides, Common.random(25, 50), {
				chamfer: chamfer
			});
	}
});

World.add(world, [
	stack,
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

// ジャイロセンサーの操作
const updateGravity = (event) => {
	const orientation = typeof window.orientation !== 'undefined' ? window.orientation : 0;
	const gravity = world.gravity;

	if (orientation === 0) {
		gravity.x = Common.clamp(event.gamma, -90, 90) / 90;
		gravity.y = Common.clamp(event.beta, -90, 90) / 90;
	} else if (orientation === 180) {
		gravity.x = Common.clamp(event.gamma, -90, 90) / 90;
		gravity.y = Common.clamp(-event.beta, -90, 90) / 90;
	} else if (orientation === 90) {
		gravity.x = Common.clamp(event.beta, -90, 90) / 90;
		gravity.y = Common.clamp(-event.gamma, -90, 90) / 90;
	} else if (orientation === -90) {
		gravity.x = Common.clamp(-event.beta, -90, 90) / 90;
		gravity.y = Common.clamp(event.gamma, -90, 90) / 90;
	}
};

window.addEventListener('deviceorientation', updateGravity);

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


feeles.openReadme('gyro/README.md');
