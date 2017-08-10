import {
	Engine,
	Render,
	Runner,
	Composite,
	Composites,
	Common,
	Query,
	MouseConstraint,
	Mouse,
	Events,
	World,
	Vertices,
	Bodies,
} from 'matter';


import engine from 'engine';
const world = engine.world;

import render from 'render';
render.options.showAngleIndicator = true;
Render.run(render);

const runner = Runner.create();
Runner.run(runner, engine);


// オブジェクトのスタック
const stack = Composites.stack(20, 20, 12, 4, 0, 0, (x, y) => {
	// ランダムの確率
	const rate = Common.random(0, 1);
	if (rate < 0.1) {
		// 10% の確率で、ここに入る
		return Bodies.rectangle(x, y, Common.random(80, 120), Common.random(20, 30));

	} else if (rate < 0.5) {
		// のこり 40% の確率で、ここに入る
		return Bodies.rectangle(x, y, Common.random(20, 50), Common.random(20, 50));

	} else {
		// のこりの確率で、ここに入る
		const _sides = Math.round(Common.random(1, 8));
		const sides = (_sides === 3) ? 4 : _sides;
		return Bodies.polygon(x, y, sides, Common.random(20, 50));

	}
});

// 星のオブジェクト
const star = Vertices.fromPath('50 0 63 38 100 38 69 59 82 100 50 75 18 100 31 59 0 38 37 38');
const concave = Bodies.fromVertices(200, 200, star);

World.add(world, [
	stack,
	concave,
	// 壁
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

Events.on(render, 'afterRender', () => {
	// 実行中は常に画面の描画が終わったら、ここに入る

	const mouse = mouseConstraint.mouse;
	const context = render.context;
	const bodies = Composite.allBodies(engine.world);
	// 線分のスタート地点
	const startPoint = {
		x: 400,
		y: 100
	};
	// 線分のエンド地点
	const endPoint = mouse.position;

	// 線分のしょう突判定
	const collisions = Query.ray(bodies, startPoint, endPoint);

	Render.startViewTransform(render);

	// 線分を画面に描画する
	context.beginPath();
	context.moveTo(startPoint.x, startPoint.y);
	context.lineTo(endPoint.x, endPoint.y);
	if (collisions.length > 0) {
		context.strokeStyle = '#fff';
	} else {
		context.strokeStyle = '#555';
	}
	context.lineWidth = 0.5;
	context.stroke();

	// 線分としょう突したオブジェクトのある位置に、四角形を描画する
	for (const collision of collisions) {
		context.rect(collision.bodyA.position.x - 4.5, collision.bodyA.position.y - 4.5, 8, 8);
	}

	context.fillStyle = 'rgba(255,165,0,0.7)';
	context.fill();

	Render.endViewTransform(render);

});

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


feeles.openReadme('raycasting/README.md');
