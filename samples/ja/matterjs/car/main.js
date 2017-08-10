import {
	Composites,
	World,
	Bodies,
} from 'matter';

import {
	world,
} from './setting';

World.add(world, [

	// 車
	Composites.car(150, 100, 100, 40, 30),

]);










import './stage';