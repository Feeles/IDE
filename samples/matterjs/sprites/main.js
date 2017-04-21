import {
	Engine,
	Render,
	Runner,
	Composites,
	Common,
	MouseConstraint,
	Mouse,
	World,
	Bodies,
} from 'matter';


// スプライトを読み込む準備
import 'lib/interrupt.js';


import engine from 'engine';
const world = engine.world;

import render from 'render';
render.options.background = '#0f0f13';
Render.run(render);

const runner = Runner.create();
Runner.run(runner, engine);


const offset = 10;
const options = {
	isStatic: true
};

// 画面よりも外側にある壁(見えない)
World.add(world, [
	Bodies.rectangle(400, -offset, 800.5 + 2 * offset, 50.5, options),
	Bodies.rectangle(400, 600 + offset, 800.5 + 2 * offset, 50.5, options),
	Bodies.rectangle(800 + offset, 300, 50.5, 600.5 + 2 * offset, options),
	Bodies.rectangle(-offset, 300, 50.5, 600.5 + 2 * offset, options)
]);

// スプライトオブジェクトのスタック
const stack = Composites.stack(20, 20, 10, 4, 0, 0, (x, y) => {
	if (Common.random() > 0.35) {
		// 35% の確率でボックス
		return Bodies.rectangle(x, y, 64, 64, {
			render: {
				strokeStyle: '#ffffff',
				sprite: {
					texture: 'sprites/box.png'
				}
			}
		});
	} else {
		// のこりの確率でボール
		return Bodies.circle(x, y, 46, {
			density: 0.0005,
			frictionAir: 0.06,
			restitution: 0.3,
			friction: 0.01,
			render: {
				sprite: {
					texture: 'sprites/ball.png'
				}
			}
		});
	}
});

World.add(world, stack);

// マウス操作
const mouse = Mouse.create(render.canvas);
const mouseConstraint = MouseConstraint.create(engine, {
	mouse: mouse,
	constraint: {
		stiffness: 0.2,
		render: {
			visible: false
		}
	}
});

World.add(world, mouseConstraint);

// keep the mouse in sync with rendering
render.mouse = mouse;


feeles.openReadme('sprites/README.md');
