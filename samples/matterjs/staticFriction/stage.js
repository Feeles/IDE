import {
	Body,
	Events,
	World,
	Bodies,
} from 'matter';

import {
	engine,
	world,
} from './setting';


// 土台のオブジェクト
const body = Bodies.rectangle(400, 500, 200, 60, {
	isStatic: true,
	chamfer: 10
});


World.add(world, [
	body,
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

Events.on(engine, 'beforeUpdate', (event) => {
	
	// 始まってからの経過時間(秒)
	const time = event.timestamp / 1000;
	
	if (time < 1) {
		return;
	}

	// 土台を左右に動かす
	const px = 400 + 100 * Math.sin(time - 1);
	Body.setVelocity(body, {
		x: px - body.position.x,
		y: 0
	});
	Body.setPosition(body, {
		x: px,
		y: body.position.y
	});
	
});
