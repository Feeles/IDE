import {
	World,
	Bodies,
} from 'matter';

import {
	world,
} from './setting';


World.add(world, [
	// 一番左のオブジェクト
	Bodies.rectangle(100, 150, 50, 50, {
		// はね返りの大きさ
		restitution: 0.9,
		// かたむき
		angle: 0,
		
	}),
	// 左から二番目のオブジェクト
	Bodies.rectangle(220, 150, 50, 50, {
		// はね返りの大きさ
		restitution: 0.9,
		// かたむき
		angle: -0.471,
		
	}),
	// 左から三番目のオブジェクト
	Bodies.rectangle(340, 150, 50, 50, {
		// はね返りの大きさ
		restitution: 0.9,
		// かたむき
		angle: -0.785,
		
	}),
	// 左から四番目のオブジェクト
	Bodies.circle(460, 150, 25, {
		// はね返りの大きさ
		restitution: 0.9,
		// かたむき
		angle: 0,
		
	}),
	// 一番右のオブジェクト
	Bodies.rectangle(100 + space * 5, 150, 180, 20, {
		// はね返りの大きさ
		restitution: 0.9,
		// かたむき
		angle: -1.57,
		
	}),
	
]);


import './setting';
