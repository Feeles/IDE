import {
	Composites,
	Common,
	World,
	Bodies,
} from 'matter';

import {
	world,
} from './setting';


World.add(world, [
	
	// 中のオブジェクトのスタック
	Composites.stack(50, 120, 11, 5, 0, 0, (x, y) => {
		
		// ランダムに形や大きさを変える
		if (Common.random(0, 1) < 0.5) {
			if (Common.random() < 0.8) {
				return Bodies.rectangle(x, y, Common.random(20, 50), Common.random(20, 50));
			} else {
				return Bodies.rectangle(x, y, Common.random(80, 120), Common.random(20, 30));
			}
		} else {
			return Bodies.polygon(x, y, Math.round(Common.random(1, 8)), Common.random(20, 50));
		}
		
	}),
	
]);

