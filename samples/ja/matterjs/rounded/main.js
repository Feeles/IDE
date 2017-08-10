import {
	World,
	Bodies,
} from 'matter';

import {
	world,
} from './setting';


World.add(world, [
	
	// すべての角が丸いオブジェクト
	Bodies.rectangle(200, 200, 100, 100, {
		chamfer: {
			radius: 20,
		},
		
	}),

	// 扇型のオブジェクト
	Bodies.rectangle(300, 200, 100, 100, {
		chamfer: {
			radius: [90, 0, 0, 0],
		},
		
	}),

	// 丸い扇型のオブジェクト
	Bodies.rectangle(400, 200, 200, 200, {
		chamfer: {
			radius: [150, 20, 40, 20],
		},
		
	}),

	// ラグビーボール状のオブジェクト
	Bodies.rectangle(200, 200, 200, 200, {
		chamfer: {
			radius: [150, 20, 150, 20],
		},
		
	}),

	// なだらかな山状のオブジェクト
	Bodies.rectangle(300, 200, 200, 50, {
		chamfer: {
			radius: [25, 25, 0, 0],
		},
		
	}),

	// 八角形のオブジェクト
	Bodies.polygon(200, 100, 8, 80, {
		chamfer: {
			radius: 30,
		},
		
	}),

	// 五角形のオブジェクト
	Bodies.polygon(300, 100, 5, 80, {
		chamfer: {
			radius: [10, 40, 20, 40, 10],
		},
		
	}),

	// 三角形のオブジェクト
	Bodies.polygon(400, 200, 3, 50, {
		chamfer: {
			radius: [20, 0, 20],
		},
		
	}),
	
]);


import './stage';
