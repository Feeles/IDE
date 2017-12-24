import {
	Engine,
	Render,
	Runner,
	Composite,
	Composites,
	Common,
	MouseConstraint,
	Mouse,
	World,
	Bodies,
} from 'matter';


import engine from 'engine';
const world = engine.world;

import render from 'render';
render.options.background = '#111';
Render.run(render);

const runner = Runner.create();
Runner.run(runner, engine);


// カテゴリー　(１つのカテゴリーは 1 bit で表されるので、表せるカテゴリーは 32 まで)
const defaultCategory = 0x0001;
const redCategory = 0x0002;
const greenCategory = 0x0004;
const blueCategory = 0x0008;

// カラー（上から 赤, 青, 緑）
const redColor = '#C44D58';
const blueColor = '#4ECDC4';
const greenColor = '#C7F464';

// 床
World.add(world, Bodies.rectangle(400, 600, 900, 50, {
	isStatic: true,
	render: {
		fillStyle: 'transparent',
		lineWidth: 1
	}
}));

/**
 * 透明な円のスタック
 * 0 ~ 2 赤いフチ
 * 3 ~ 5 緑のフチ
 * 6 ~ 9 青いフチ
 */
World.add(world,
	Composites.stack(275, 100, 5, 9, 10, 10, (x, y, column, row) => {

		return Bodies.circle(x, y, 20, {
			collisionFilter: {
				category: row <= 2 ? redCategory : row <= 5 ? greenCategory : blueCategory
			},
			render: {
				strokeStyle: row <= 2 ? redColor : row <= 5 ? greenColor : blueColor,
				fillStyle: 'transparent',
				lineWidth: 1
			}
		});
	
	})
);

// 緑カテゴリーのオブジェクトにしかぶつからない、緑の円
World.add(world,
	Bodies.circle(310, 40, 30, {
		collisionFilter: {
			mask: defaultCategory | greenCategory
		},
		render: {
			strokeStyle: Common.shadeColor(greenColor, -20),
			fillStyle: greenColor
		}
	})
);

// 赤カテゴリーのオブジェクトにしかぶつからない、赤の円
World.add(world,
	Bodies.circle(400, 40, 30, {
		collisionFilter: {
			mask: defaultCategory | redCategory
		},
		render: {
			strokeStyle: Common.shadeColor(redColor, -20),
			fillStyle: redColor
		}
	})
);

// 青カテゴリーのオブジェクトにしかぶつからない、青の円
World.add(world,
	Bodies.circle(480, 40, 30, {
		collisionFilter: {
			mask: defaultCategory | blueCategory
		},
		render: {
			strokeStyle: Common.shadeColor(blueColor, -20),
			fillStyle: blueColor
		}
	})
);

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

// 赤カテゴリーのオブジェクトをマウスでドラッグさせない
mouseConstraint.collisionFilter.mask = defaultCategory | blueCategory | greenCategory;


feeles.openReadme('collisionFiltering/README.md');
