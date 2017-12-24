import {
	Composites,
	World,
	Bodies,
} from 'matter';

import {
	world,
} from './setting';


World.add(world, [
	
	// オブジェクトのスタック
	Composites.stack(200, 380, 10, 5, 0, 0, (x, y) => {
		return Bodies.rectangle(x, y, 40, 40);
	}),
	
]);







import './stage';

