import {
	Body,
	Composites,
	World,
	Bodies,
} from 'matter';

import {
	world,
} from './setting';

// ニュートンのゆりかごをつくる
const cradle1 = Composites.newtonsCradle(280, 200, 5, 30, 200);

World.add(world, [
	// ニュートンのゆりかご
	cradle1,
	
]);

// 一番左の円だけを左上に動かす
Body.translate(cradle1.bodies[0], {
	x: -180,
	y: -100,
});


