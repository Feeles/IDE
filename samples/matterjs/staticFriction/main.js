import {
	Composites,
	World,
	Bodies,
} from 'matter';

import {
	world,
} from './setting';


World.add(world, [

	// 上に乗っているオブジェクトのスタック
	Composites.stack(350, 170, 1, 6, 0, 0, (x, y) => {
		return Bodies.rectangle(x, y, 100, 50, {
			slop: 0.5,
			friction: 1,
			frictionStatic: Infinity
		});
	}),

]);


import './stage';
