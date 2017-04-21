import {
	Composites,
	Body,
	Events,
	World,
	Bodies,
} from 'matter';

import {
	engine,
	world,
} from './setting';


// センサーのオブジェクトをつくる
const sensor = Bodies.rectangle(740, 400, 60, 20, {
	isSensor: true,
	isStatic: true,
	render: {
		strokeStyle: '#FFFF00',
		fillStyle: 'transparent',
		lineWidth: 1
	}
});


World.add(world, [

	// センサーのオブジェクト
	sensor,

	// さいしょのコイン
	Bodies.rectangle(750, 350, 50, 10, {
		chamfer: {
			radius: 4,
		},
		render: {
			fillStyle: '#FFFF00',
			strokeStyle: '#000000',
			lineWidth: 1,
		},
		// ツルツルにする
		slop: 0.005,
		friction: 0.01,
		frictionStatic: 10,
		restitution: 0.3,
		// タテにする
		angle: 1.57,

	}),

]);



Events.on(engine, 'collisionStart', function(event) {
	// しょう突が始まったら、ここに入る

	for (const pair of event.pairs) {
		if (pair.bodyA === sensor || pair.bodyB === sensor) {
			// センサーとぶつかったら、ここに入る

			World.add(world, [

				// コインのオブジェクトのスタック
				Composites.stack(50, 300, 2, 5, 0, 0, (x, y) => {
					return Bodies.rectangle(x, y, 50, 10, {
						chamfer: {
							radius: 4,
						},
						render: {
							fillStyle: '#FFFF00',
							strokeStyle: '#000000',
							lineWidth: 1,
						},
						slop: 0.005,
						friction: 0.01,
						frictionStatic: 10,
						restitution: 0.3,
						restitution: 0.3,

					});
				}),

			]);

		}
	}

});
