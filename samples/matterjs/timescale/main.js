import {
	Engine,
	Render,
	Runner,
	Body,
	Events,
	Composite,
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


World.add(world, [
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

// 画面全体を爆発させる！
const explosion = (engine) => {
	const bodies = Composite.allBodies(engine.world);

	for (const body of bodies) {
		if (!body.isStatic && body.position.y >= 500) {
			const forceMagnitude = 0.05 * body.mass;

			Body.applyForce(body, body.position, {
				x: (forceMagnitude + Common.random() * forceMagnitude) * Common.choose([1, -1]),
				y: -forceMagnitude + Common.random() * -forceMagnitude
			});
		}
	}
};

// 開始してから、つねに 1 ずつ増えていく変数
let counter = 0;

Events.on(engine, 'afterUpdate', (event) => {

	// 開始してから、つねに 1 ずつ増えていく変数
	counter += 1;

	if (counter % 100 === 0) {
		// 100 フレームに一度、爆発をおこす
		explosion(engine);

	}

	// counter が 0~99 なら通常スピード,
	// 100~199 ならスローモーション... を繰り返す
	const timeScaleTarget = counter % 200 < 100 ? 1 : 0.05;

	// 徐々に timeScaleTarget に近づけていく
	engine.timing.timeScale += (timeScaleTarget - engine.timing.timeScale) * 0.05;

});

const bodyOptions = {
	frictionAir: 0,
	friction: 0.0001,
	restitution: 0.8
};

// 円のオブジェクト
World.add(world, Composites.stack(20, 100, 15, 3, 20, 40, (x, y) => {
	return Bodies.circle(x, y, Common.random(10, 20), bodyOptions);
}));

// その他のオブジェクト
World.add(world, Composites.stack(50, 50, 8, 3, 0, 0, (x, y) => {
	// ランダムの確率
	const rate = Common.random(0, 1);
	if (rate < 0.1) {
		// 10% の確率で、ここに入る
		return Bodies.rectangle(x, y, Common.random(80, 120), Common.random(20, 30), bodyOptions);

	} else if (rate < 0.5) {
		// のこり 40% の確率で、ここに入る
		return Bodies.rectangle(x, y, Common.random(20, 50), Common.random(20, 50), bodyOptions);

	} else {
		// のこりの確率で、ここに入る
		return Bodies.polygon(x, y, Math.round(Common.random(4, 8)), Common.random(20, 50), bodyOptions);

	}

}));

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


feeles.openReadme('timescale/README.md');
