import {
	Body,
	World,
	Bodies,
} from 'matter';

import {
	world,
} from './setting';



// 横棒
const partA = Bodies.rectangle(200, 300, 200, 40);
// タテ棒
const partB = Bodies.rectangle(200, 300, 40, 200, {
	// 横棒 と色を同じにする
	render: partA.render,
	
});

// partA と partB を合成
const partAB = Body.create({
	parts: [
		partA, 
		partB,
		
	]
});

World.add(world, [
	// ＋ のオブジェクト
	partAB,
	
]);


// 上の点
const part1 = Bodies.circle(600, 220, 30);
// 横棒
const part2 = Bodies.rectangle(600, 300, 200, 40, {
	// 上の点 と色を同じにする
	render: part1.render,
	
});
// 下の点
const part3 = Bodies.circle(600, 380, 30, {
	// 上の点 と色を同じにする
	render: part1.render,
	
});

// partC と partD と partE を合成
const part123 = Body.create({
	parts: [
		part1, 
		part2,
		part3,
		
	]
});

World.add(world, [
	// ÷ のオブジェクト
	part123,
	
]);


import './stage';
