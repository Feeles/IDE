import {
	Composites,
	World,
	Bodies,
} from 'matter';

import {
	world,
} from './setting';


World.add(world, [
	
	// ソフトボディ
	Composites.softBody(250, 100, 6, 5, 0, 0, true, 18, {
		// まさつの大きさ
		friction: 0.1,
		
	}),
	
]);


import './stage';