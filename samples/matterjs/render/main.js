import {
	World,
	Bodies,
} from 'matter';

import {
	world,
} from './setting.js';

World.add(world, [

	// 赤色のオブジェクト
	Bodies.rectangle(200, 100, 100, 100, {
		render: {
			// ぬりつぶしの色
			fillStyle: '#FF0000',
		},

	}),

	// 黄色のオブジェクト
	Bodies.rectangle(400, 100, 100, 100, {
		render: {
			// ぬりつぶしの色
			fillStyle: '#FFFF00',
			// 線の色
			strokeStyle: '#000000',
			// 線の太さ
			lineWidth: 1,
		},

	}),

	// 緑色のオブジェクト
	Bodies.rectangle(600, 100, 100, 100, {
		render: {
			// ぬりつぶしの色
			fillStyle: '#00FF00',
			// 線の色
			strokeStyle: '#FFFFFF',
			// 線の太さ
			lineWidth: 20,
		},

	}),

]);


import './stage.js';
