import {
	Composites,
	World,
	Bodies,
} from 'matter';

import {
	world,
} from './setting';


World.add(world, [
	// 小さなオブジェクトのスタック
	Composites.stack(250, 255, 1, 6, 0, 0, (x, y) => {
		return Bodies.rectangle(x, y, 30, 30);
	}),

	// 地面のオブジェクト
	Bodies.rectangle(400, 600, 800, 50.5, {
		isStatic: true,

	}),

]);
