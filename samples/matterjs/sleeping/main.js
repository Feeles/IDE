import {
	Engine,
	Render,
	Runner,
	Composites,
	Common,
	Events,
	MouseConstraint,
	Mouse,
	World,
	Bodies,
} from 'matter';


import engine from 'engine';
const world = engine.world;

import render from 'render';
render.options.showAngleIndicator = true;
render.options.showSleeping = true;
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
const stack = Composites.stack(50, 50, 12, 3, 0, 0, (x, y) => {
	// ランダムの確率
	const rate = Common.random(0, 1);
	if (rate < 0.1) {
		// 10% の確率で、ここに入る
		return Bodies.rectangle(x, y, Common.random(80, 120), Common.random(20, 30));
	} else if (rate < 0.5) {
		// のこり 40% の確率で、ここに入る
		return Bodies.rectangle(x, y, Common.random(20, 50), Common.random(20, 50));
	} else {
		// のこりの確率で、ここに入る
		return Bodies.polygon(x, y, Math.round(Common.random(1, 8)), Common.random(20, 50));
	}
});

World.add(world, stack);

for (const body of stack.bodies) {
	Events.on(body, 'sleepStart sleepEnd', (event) => {
	// オブジェクトがスリープモードになったとき または そうでなくなったとき、ここに入る
		
		console.log('body id', body.id, 'sleeping:', body.isSleeping);
	
	});
}

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


feeles.openReadme('sleeping/README.md');

