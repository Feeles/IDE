import Matter, {
	Engine,
	Render,
	Runner,
	Body,
	Common,
	MouseConstraint,
	Mouse,
	World,
	Bodies,
} from 'matter';

import 'plugins/attractorsPlugin.js';
import 'plugins/gravityPlugin.js';
import 'plugins/wrapPlugin.js';

Matter.use(
	'matter-gravity',
	'matter-wrap'
);

import engine from 'engine';
engine.timing.timeScale = 1.5;
	
const world = engine.world;
world.gravity.scale = 0;
	
import render from 'render';
Render.run(render);

// create runner
const runner = Runner.create();
Runner.run(runner, engine);
	

const G = 0.001;
const speed = 5;

	
for (const _ of [...Array(150)]) {
	const radius = Common.random(6, 10);

	const body = Bodies.circle(
		Common.random(10, render.options.width),
		Common.random(10, render.options.height),
		radius, {
			mass: Common.random(10, 15),
			frictionAir: 0,
			plugin: {
				gravity: G,
				wrap: {
					min: {
						x: 0,
						y: 0
					},
					max: {
						x: render.options.width,
						y: render.options.height
					}
				}
			}
		}
	);

	Body.setVelocity(body, {
		x: Common.random(-speed, speed),
		y: Common.random(-speed, speed)
	});

	World.add(world, body);
}

// add mouse control
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

	
feeles.openReadme('attractors/README.md');
