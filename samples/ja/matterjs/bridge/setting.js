import {
	Render,
	Runner,
	MouseConstraint,
	Mouse,
	World,
} from 'matter';


import engine from 'engine';
const world = engine.world;

import render from 'render';
Render.run(render);
render.options.background = '#aaaaaa';

const runner = Runner.create();
Runner.run(runner, engine);


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


feeles.openReadme('bridge/README.md');


export {
	engine,
	world,
	render,
};
