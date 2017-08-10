import {
	Composites,
	World,
	Bodies,
} from 'matter';

import {
	world,
} from './setting';


World.add(world, [
	
	// ピラミッド
	Composites.pyramid(100, 258, 15, 10, 0, 0, (x, y) => {
		return Bodies.rectangle(x, y, 40, 40, {
			// オブジェクトの色
			render: {
				fillStyle: "#F0C000",
			},
			
		});
	}),
	
]);



import './stage';
