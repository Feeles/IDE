import {
	Engine,
	Render,
	Runner,
	Composites,
	Common,
	MouseConstraint,
	Mouse,
	World,
	Vertices,
	Query,
	Svg,
	Bodies,
} from 'matter';


import engine from 'engine';
const world = engine.world;

import render from 'render';
Render.run(render);

// create runner
const runner = Runner.create();
Runner.run(runner, engine);

feeles.fetch('terrain/terrain.svg')
	.then((response) => response.text())
	.then((data) => {
		const vertexSets = [];

		for (const path of getPathElements(data)) {
			const points = pathToVertices(path, 30);
			vertexSets.push(Vertices.scale(points, 0.4, 0.4));
		}

		// add bodies
		const terrain = Bodies.fromVertices(400, 350, vertexSets, {
			isStatic: true,
			render: {
				fillStyle: '#2e2b44',
				strokeStyle: '#2e2b44',
				lineWidth: 1
			}
		}, true);

		World.add(world, terrain);

		const bodyOptions = {
			frictionAir: 0,
			friction: 0.0001,
			restitution: 0.6
		};

		World.add(world, Composites.stack(80, 100, 20, 20, 10, 10, (x, y) => {
			if (Query.point([terrain], {
					x,
					y
				}).length === 0) {
				return Bodies.polygon(x, y, 5, 12, bodyOptions);
			}
		}));
	});

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


function getPathElements(svg) {
	const span = document.createElement('span');
	span.innerHTML = svg;
	return span.querySelectorAll('path');
}

function pathToVertices(path, sampleLength) {
	const total = path.getTotalLength();

	const points = [];
	for (let length = 0; length < total; length += sampleLength) {
		points.push(path.getPointAtLength(length));
	}

	return points;
}


feeles.openReadme('terrain/README.md');
