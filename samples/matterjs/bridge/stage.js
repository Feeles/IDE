import {
	Composites,
	World,
	Bodies,
	Common,
} from 'matter';

import {
	world,
} from './setting';


World.add(world, [
	// 	左の大きな四角
	Bodies.rectangle(80, 440, 120, 280, {
		isStatic: true,
	}),

	// 	右の大きな四角
	Bodies.rectangle(720, 440, 120, 280, {
		isStatic: true,
	}),

	// 上に乗っているオブジェクトのスタック
	Composites.stack(200, 40, 6, 3, 0, 0, (x, y) => {
		return Bodies.polygon(x, y, Math.round(Common.random(1, 8)), Common.random(20, 40));
	}),

]);