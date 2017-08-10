import {
	Body,
	Composites,
	World,
	Bodies,
} from 'matter';

import {
	world,
} from './setting';


// 合成したオブジェクトのスタック
const stack = Composites.stack(100, 280, 12, 6, 0, 0, (x, y) => {
	// 横棒
	const partA = Bodies.rectangle(x, y, 50, 10);
	// タテ棒
	const partB = Bodies.rectangle(x, y, 10, 50, {
		// 横棒と見た目を同じにする
		render: partA.render,
		
	});
	
	// 合成されたオブジェクトのひとつ
	return Body.create({
		parts: [
			partA, 
			partB,
		]
	});
});

World.add(world, [
	// スタック
	stack,
	
]);


import './stage';
