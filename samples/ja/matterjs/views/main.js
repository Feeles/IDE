import {
	Engine,
	Render,
	Runner,
	Events,
	Composites,
	Common,
	MouseConstraint,
	Mouse,
	World,
	Vector,
	Bounds,
	Bodies,
} from 'matter';


import engine from 'engine';
const world = engine.world;

import render from 'render';
render.options.hasBounds = true;
render.options.showAngleIndicator = true;
Render.run(render);

const runner = Runner.create();
Runner.run(runner, engine);


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

// オブジェクトのスタック
const stack = Composites.stack(20, 20, 15, 4, 0, 0, (x, y) => {
	// ランダムの確率
	const rate = Common.random(0, 1);
	if (rate < 0.1) {
		// 10% の確率で、ここに入る
		return Bodies.rectangle(x, y, Common.random(80, 120), Common.random(20, 30));

	} else if (rate < 0.5) {
		// のこり 40% の確率で、ここに入る
		return Bodies.rectangle(x, y, Common.random(80, 120), Common.random(20, 30));

	} else {
		// のこりの確率で、ここに入る
		const _sides = Math.round(Common.random(1, 8));
		const sides = (_sides === 3) ? 4 : _sides;
		return Bodies.polygon(x, y, sides, Common.random(20, 50));

	}
});

World.add(world, [
	stack,
	// 壁のオブジェクト
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

// 画面の中心
const viewportCentre = {
	x: render.options.width * 0.5,
	y: render.options.height * 0.5
};

// ワールドの領域を画面より少し大きなサイズにする
world.bounds.min.x = -300;
world.bounds.min.y = -300;
world.bounds.max.x = 1100;
world.bounds.max.y = 900;

// いま目指している拡大の倍率の変数
let boundsScaleTarget = 1;
// 現在の拡大の倍率
const boundsScale = {
	x: 1,
	y: 1
};

Events.on(engine, 'beforeTick', function() {
	const mouse = mouseConstraint.mouse;

	// マウスのホイールで倍率を変える
	const scaleFactor = mouse.wheelDelta * -0.1;
	if (scaleFactor !== 0) {
		if ((scaleFactor < 0 && boundsScale.x >= 0.6) || (scaleFactor > 0 && boundsScale.x <= 1.4)) {
			boundsScaleTarget += scaleFactor;
		}
	}

	if (Math.abs(boundsScale.x - boundsScaleTarget) > 0.01) {
		// 拡大の倍率が変わっていたとき、ここに入る

		// 変化がなだらかになるように少しだけを戻す
		const scaleFactor = (boundsScaleTarget - boundsScale.x) * 0.2;
		boundsScale.x += scaleFactor;
		boundsScale.y += scaleFactor;

		// 描画する領域を拡大する
		render.bounds.max.x = render.bounds.min.x + render.options.width * boundsScale.x;
		render.bounds.max.y = render.bounds.min.y + render.options.height * boundsScale.y;

		// ズームによって画面の中心が少しずれるので、それをなおす
		const translate = {
			x: render.options.width * scaleFactor * -0.5,
			y: render.options.height * scaleFactor * -0.5
		};
		Bounds.translate(render.bounds, translate);

		// マウスがズームの影響を受けないように補正する
		Mouse.setScale(mouse, boundsScale);
		Mouse.setOffset(mouse, render.bounds.min);

	}

	// 画面の中心からマウスまでのベクトル
	const deltaCentre = Vector.sub(mouse.absolute, viewportCentre);
	// 画面の中心からマウスまでの距離
	const centreDist = Vector.magnitude(deltaCentre);

	if (centreDist > 50) {
		// 画面の中心からマウスまでの距離が 50px を超えているとき、ここに入る

		// 画面の中心からマウスに向かう方向のベクトル
		const direction = Vector.normalise(deltaCentre);
		// ちょうどいい感じのうごく距離
		const speed = Math.min(10, Math.pow(centreDist - 50, 2) * 0.0002);
		// 画面の中心からマウスに向かうちょうどいい感じの長さのベクトル
		const translate = Vector.mult(direction, speed);

		// 描画する領域が、ワールドの領域からはみ出さないようにする
		if (render.bounds.min.x + translate.x < world.bounds.min.x) {
			translate.x = world.bounds.min.x - render.bounds.min.x;
		}
		if (render.bounds.max.x + translate.x > world.bounds.max.x) {
			translate.x = world.bounds.max.x - render.bounds.max.x;
		}
		if (render.bounds.min.y + translate.y < world.bounds.min.y) {
			translate.y = world.bounds.min.y - render.bounds.min.y;
		}
		if (render.bounds.max.y + translate.y > world.bounds.max.y) {
			translate.y = world.bounds.max.y - render.bounds.max.y;
		}
		// スクロールする。つまり、描画する領域を少し移動する
		Bounds.translate(render.bounds, translate);

		// マウスがスクロールの影響を受けないように補正する
		Mouse.setOffset(mouse, render.bounds.min);

	}
});


feeles.openReadme('views/README.md');
