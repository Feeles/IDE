import {
	World,
	Bodies,
} from 'matter';
import {
	world,
} from './setting';


// かべ
World.add(world, [
	Bodies.rectangle(400, 0, 800, 50, {
		isStatic: true
	}),
	Bodies.rectangle(400, 600, 800, 50, {
		isStatic: true
	}),
	Bodies.rectangle(800, 300, 50, 600, {
		isStatic: true
	}),
	Bodies.rectangle(0, 300, 50, 600, {
		isStatic: true
	})
]);

// ゆか
World.add(world, [
	Bodies.rectangle(300, 180, 700, 20, {
		isStatic: true,
		angle: Math.PI * 0.06
	}),
	Bodies.rectangle(300, 350, 700, 20, {
		isStatic: true,
		angle: Math.PI * 0.06
	}),
	Bodies.rectangle(300, 520, 700, 20, {
		isStatic: true,
		angle: Math.PI * 0.06
	}),
]);
