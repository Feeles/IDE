import {
	World,
	Bodies,
} from 'matter';
import {
	world,
} from './setting';


// 壁
World.add(world, [
	
	// 左のオブジェクト
	Bodies.rectangle(200, 100, 60, 60, {
		// はね返りの大きさ
		restitution: 0.01,
		
	}),
	
	// 中のオブジェクト
	Bodies.rectangle(400, 100, 60, 60, {
		// はね返りの大きさ
		restitution: 0.5,
		
	}),
	
	// 右のオブジェクト
	Bodies.rectangle(600, 100, 60, 60, {
		// はね返りの大きさ
		restitution: 1,
		
	}),
	
	// 天井のオブジェクト
	Bodies.rectangle(400, 0, 800, 50, {
		isStatic: true,
		
	}),
	// ゆかのオブジェクト
	Bodies.rectangle(400, 600, 800, 50, {
		isStatic: true,
		angle: 0.1,
		
	}),
	// 右のかべのオブジェクト
	Bodies.rectangle(800, 300, 50, 600, {
		isStatic: true,
		
	}),
	// 左のかべのオブジェクト
	Bodies.rectangle(0, 300, 50, 600, {
		isStatic: true,
		
	}),
]);
