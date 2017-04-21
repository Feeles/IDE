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


// コインを運ぶバー
const bar1 = Bodies.rectangle(700, 350, 250, 50, {
	// 固定する
	isStatic: true,
	
});

World.add(world, [
	
	// コインを運ぶバー
	bar1,
	
	// バーの上のストッパー
	Bodies.rectangle(750, 300, 70, 50, {
		// 固定する
		isStatic: true,

	}),
	
]);

Events.on(engine, 'beforeUpdate', (event) => {
	
	// 始まってからの経過時間(秒)
	const time = event.timestamp / 1000;

	// バーを左右に動かす
	const px = 700 + 150 * Math.sin(time - 1);
	Body.setVelocity(bar1, {
		x: px - bar1.position.x,
		y: 0
	});
	Body.setPosition(bar1, {
		x: px,
		y: bar1.position.y
	});
	
});


import './stage';
import './sensor';
