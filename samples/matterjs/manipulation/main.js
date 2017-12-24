import {
	Engine,
	Render,
	Runner,
	Body,
	Events,
	MouseConstraint,
	Mouse,
	World,
	Bodies,
} from 'matter';


import engine from 'engine';
const world = engine.world;

import render from 'render';
render.options.showAxes = true;
render.options.showCollisions = true;
render.options.showConvexHulls = true;
Render.run(render);

const runner = Runner.create();
Runner.run(runner, engine);


// 左で静止しているオブジェクト
const bodyA = Bodies.rectangle(100, 200, 50, 50, {
	isStatic: true
});
// 四角いオブジェクト（左から順）
const bodyB = Bodies.rectangle(200, 200, 50, 50);
const bodyC = Bodies.rectangle(300, 200, 50, 50);
const bodyD = Bodies.rectangle(400, 200, 50, 50);
const bodyE = Bodies.rectangle(550, 200, 50, 50);
const bodyF = Bodies.rectangle(700, 200, 50, 50);
// 始まってすぐ静止する円のオブジェクト
const bodyG = Bodies.circle(400, 100, 25);
// 十字のオブジェクト
const partA = Bodies.rectangle(600, 200, 120, 50);
const partB = Bodies.rectangle(660, 200, 50, 190);
const compound = Body.create({
	parts: [partA, partB],
	isStatic: true
});

World.add(world, [bodyA, bodyB, bodyC, bodyD, bodyE, bodyF, bodyG, compound]);

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

// beforeUpdate ごとに 1 ずつ増える変数
let counter = 0;

Events.on(engine, 'beforeUpdate', (event) => {
	// 実行中常に毎フレーム、ここに入る

	// beforeUpdate ごとに 1 ずつ増える変数
	counter += 1;
	// 始まってからの経過時間（秒）
	const time = event.timestamp / 1000;

	if (time > 2) {
		// ２秒たったらここに入る
		if (!bodyG.isStatic) {
			Body.setStatic(bodyG, true);
		}

	}

	// 静止している bodyA の位置を直接変更する
	const py = 300 + 100 * Math.sin(time * 2);
	Body.setVelocity(bodyA, {
		x: 0,
		y: py - bodyA.position.y
	});
	Body.setPosition(bodyA, {
		x: 100,
		y: py
	});

	// 十字のオブジェクトを振り子のように動かす
	Body.setVelocity(compound, {
		x: 0,
		y: py - compound.position.y
	});
	Body.setAngularVelocity(compound, 0.02);
	Body.setPosition(compound, {
		x: 600,
		y: py
	});
	// 十字のオブジェクトを回転させる
	Body.rotate(compound, 0.02);

	if (counter % 100 === 0) {
		// counter が 100 の倍数のときだけ、ここに入る

		// bodyB をジャンプさせる
		Body.setVelocity(bodyB, {
			x: 0,
			y: -10
		});
		// bodyC をナナメにする
		Body.setAngle(bodyC, -Math.PI * 0.26);
		// bodyD を回転させる
		Body.setAngularVelocity(bodyD, 0.2);

	}
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


feeles.openReadme('manipulation/README.md');
