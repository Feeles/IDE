import {
	Engine,
	Render,
	Runner,
	Body,
	Composites,
	MouseConstraint,
	Mouse,
	World,
	Bodies,
} from 'matter';


import engine from 'engine';
const world = engine.world;

import render from 'render';
render.options.background = '#0f0f13';
Render.run(render);

const runner = Runner.create();
Runner.run(runner, engine);


// 布のオブジェクト
const group = Body.nextGroup(true);
const particleOptions = {
	friction: 0.00001,
	collisionFilter: {
		group: group
	},
	render: {
		visible: false,
	}
};
const cloth = Composites.softBody(200, 200, 20, 12, 5, 5, false, 8, particleOptions);

// 一番上の行だけ、動かないように
for (let i = 0; i < 20; i++) {
	Body.setStatic(cloth.bodies[i], true);
}

World.add(world, [
	cloth,
	// 	円のオブジェクト
	Bodies.circle(300, 500, 80, {
		isStatic: true
	}),
	// 	四角のオブジェクト
	Bodies.rectangle(500, 480, 80, 80, {
		isStatic: true
	}),
	// 	床のオブジェクト
	Bodies.rectangle(400, 609, 800, 50, {
		isStatic: true
	})
]);

// マウス操作
const mouse = Mouse.create(render.canvas);
const mouseConstraint = MouseConstraint.create(engine, {
	mouse: mouse,
	constraint: {
		stiffness: 0.98,
		render: {
			visible: false
		}
	}
});

World.add(world, mouseConstraint);

// keep the mouse in sync with rendering
render.mouse = mouse;


feeles.openReadme('cloth/README.md');
