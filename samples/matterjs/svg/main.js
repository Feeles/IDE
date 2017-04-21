import {
	Engine,
	Render,
	Runner,
	Common,
	MouseConstraint,
	Mouse,
	World,
	Vertices,
	Svg,
	Bodies,
} from 'matter';


import engine from 'engine';
const world = engine.world;

import render from 'render';
Render.run(render);

const runner = Runner.create();
Runner.run(runner, engine);

const svgs = [
	'iconmonstr-check-mark-8-icon',
	'iconmonstr-paperclip-2-icon',
	'iconmonstr-puzzle-icon',
	'iconmonstr-user-icon'
];

// パラメータ
const scale = 0.8;
const sampling = 15;

for (const [i, name] of svgs.entries()) {
	feeles.fetch(`svg/${name}.svg`)
		.then((response) => response.text())
		.then((data) => {

			const color = Common.choose(['#556270', '#4ECDC4', '#C7F464', '#FF6B6B', '#C44D58']);
			const vertexSets = [];

			for (const path of getPathElements(data)) {
				const points = pathToVertices(path, sampling);
				vertexSets.push(Vertices.scale(points, scale, scale));
			}

			World.add(world, Bodies.fromVertices(100 + i * 150, 200 + i * 50, vertexSets, {
				render: {
					fillStyle: color,
					strokeStyle: color,
					lineWidth: 1
				}
			}, true));

		});
}

feeles.fetch('svg/svg.svg')
	.then((response) => response.text())
	.then((data) => {

		const color = Common.choose(['#556270', '#4ECDC4', '#C7F464', '#FF6B6B', '#C44D58']);
		const vertexSets = [];

		for (const path of getPathElements(data)) {
			const points = pathToVertices(path, sampling);
			vertexSets.push(Vertices.scale(points, scale, scale));
		}

		World.add(world, Bodies.fromVertices(400, 80, vertexSets, {
			render: {
				fillStyle: color,
				strokeStyle: color,
				lineWidth: 1
			}
		}, true));

	});

World.add(world, [
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


feeles.openReadme('svg/README.md');
