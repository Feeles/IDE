import {
	World,
	Bodies,
	Composites,
	
} from 'matter';

import {
	world,
} from './setting';


World.add(world, [
	
	// 円のスタック
	Composites.stack(100, 185, 10, 10, 20, 0, (x, y) => {
		return Bodies.circle(x, y, 20);
	}),
	
]);








import './stage';
