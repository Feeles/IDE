import {
	Engine,
	Render,
	Runner,
	Events,
	MouseConstraint,
	Mouse,
	World,
	Bodies,
} from 'matter';


import engine from 'engine';
const world = engine.world;

import render from 'render';
render.options.wireframes = false;
render.options.background = '#111';
Render.run(render);

const runner = Runner.create();
Runner.run(runner, engine);


// 色
const redColor = '#C44D58';
const greenColor = '#C7F464';

// センサーのオブジェクト
const collider = Bodies.rectangle(400, 300, 500, 50, {
	isSensor: true,
	isStatic: true,
	render: {
		strokeStyle: redColor,
		fillStyle: 'transparent',
		lineWidth: 1
	}
});

World.add(world, [
	collider,
	// 床のオブジェクト
	Bodies.rectangle(400, 620, 800, 50, {
		isStatic: true,
		render: {
			fillStyle: 'transparent',
			lineWidth: 1
		}
	})
]);


World.add(world,
	// 円のオブジェクト
	Bodies.circle(400, 40, 30, {
		render: {
			strokeStyle: greenColor,
			fillStyle: 'transparent',
			lineWidth: 1
		}
	})
);

Events.on(engine, 'collisionStart', function(event) {
	// しょう突が始まったら、ここに入る
	
	for (const pair of event.pairs) {
		if (pair.bodyA === collider) {
			pair.bodyB.render.strokeStyle = redColor;
		} else if (pair.bodyB === collider) {
			pair.bodyA.render.strokeStyle = redColor;
		}
	}
	
});

Events.on(engine, 'collisionEnd', function(event) {
	// しょう突が始まったら、ここに入る
	
	for (const pair of event.pairs) {
		if (pair.bodyA === collider) {
			pair.bodyB.render.strokeStyle = greenColor;
		} else if (pair.bodyB === collider) {
			pair.bodyA.render.strokeStyle = greenColor;
		}
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


feeles.openReadme('sensors/README.md');
