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
Render.run(render);

const runner = Runner.create();
Runner.run(runner, engine);

Events.on(world, 'afterAdd', (event) => {
	// オブジェクトやスタックが新しく追加されたとき、ここに入る
	console.log('added to world:', event.object);

});

Events.on(engine, 'beforeUpdate', (event) => {
	// 実行中は常に毎フレーム、ここに入る
	const engine = event.source;
	if (event.timestamp % 5000 < 50) {

		// 5秒おきに、ここに入る
		shakeScene(engine);

	}

});

Events.on(engine, 'collisionStart', (event) => {
	// いずれかのオブジェクトがしょう突したとき、ここに入る

	// しょう突した両方のオブジェクトの色を変える
	for (const pair of event.pairs) {
		pair.bodyA.render.fillStyle = '#333';
		pair.bodyB.render.fillStyle = '#333';
	}

});

Events.on(engine, 'collisionActive', (event) => {
	// いずれかのオブジェクトがしょう突し続けている間常に、ここに入る

	// しょう突している両方のオブジェクトの色を変える
	for (const pair of event.pairs) {
		pair.bodyA.render.fillStyle = '#333';
		pair.bodyB.render.fillStyle = '#333';
	}

});

Events.on(engine, 'collisionEnd', (event) => {
	// しょう突が終わった（離れた）とき、ここに入る

	// 離れた両方のオブジェクトの色を変える	
	for (const pair of event.pairs) {
		pair.bodyA.render.fillStyle = '#222';
		pair.bodyB.render.fillStyle = '#222';
	}

});

const bodyStyle = {
	fillStyle: '#222'
};

World.add(world, [
	// 壁
	Bodies.rectangle(400, 0, 800, 50, {
		isStatic: true,
		render: bodyStyle
	}),
	Bodies.rectangle(400, 600, 800, 50, {
		isStatic: true,
		render: bodyStyle
	}),
	Bodies.rectangle(800, 300, 50, 600, {
		isStatic: true,
		render: bodyStyle
	}),
	Bodies.rectangle(0, 300, 50, 600, {
		isStatic: true,
		render: bodyStyle
	})
]);

// 飛び回っている円のスタック
const stack = Composites.stack(70, 100, 9, 4, 50, 50, (x, y) => {
	return Bodies.circle(x, y, 15, {
		restitution: 1,
		render: bodyStyle
	});
});

World.add(world, stack);

// 画面全体をシェイク！
const shakeScene = (engine) => {
	const bodies = Composite.allBodies(engine.world);

	for (const body of bodies) {
		if (!body.isStatic && body.position.y >= 500) {
			const forceMagnitude = 0.02 * body.mass;

			Body.applyForce(body, body.position, {
				x: (forceMagnitude + Common.random() * forceMagnitude) * Common.choose([1, -1]),
				y: -forceMagnitude + Common.random() * -forceMagnitude
			});
		}
	}
};

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

Events.on(mouseConstraint, 'mousedown', (event) => {
	// マウスが押されたとき、ここに入る
	const mousePosition = event.mouse.position;
	console.log('mousedown at ' + mousePosition.x + ' ' + mousePosition.y);
	shakeScene(engine);

});

Events.on(mouseConstraint, 'mouseup', (event) => {
	// マウスが離れたとき、ここに入る
	const mousePosition = event.mouse.position;
	console.log('mouseup at ' + mousePosition.x + ' ' + mousePosition.y);

});

Events.on(mouseConstraint, 'startdrag', (event) => {
	// マウスがドラッグを始めたとき、ここに入る
	console.log('startdrag', event);

});

Events.on(mouseConstraint, 'enddrag', (event) => {
	// マウスがドラッグを終えたとき、ここに入る
	console.log('enddrag', event);

});


feeles.openReadme('events/README.md');