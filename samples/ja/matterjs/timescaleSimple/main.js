import {
	World,
	
} from 'matter';

import {
	engine,
	world,
	render,
} from './setting.js';

// タイマー 1
setTimeout(() => {
	// 2秒たったら、ここに入る
	
	// 時間の早さを 1/10 に
	engine.timing.timeScale = 0.1;
	
	// 背景を黒に
	render.options.background = '#000000';
	
	
}, 2000);

// タイマー 2
setTimeout(() => {
	// 5秒たったら、ここに入る
	
	// 時間の早さを 2 倍に
	engine.timing.timeScale = 2;
	
	// 背景を白に
	render.options.background = '#ffffff';
	
	
}, 5000);




import './stage.js';
