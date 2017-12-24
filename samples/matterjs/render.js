import {
	Render,
} from 'matter';


import engine from 'engine';

const options = {
	width: 800,
	height: 600,
	// 背景色
	background: '#fafafa',
	hasBounds: false,
	enabled: true,
	// モノクロ化 (高速になる)
	wireframes: false,
	wireframeBackground: '#222',
	showSleeping: false,
	showDebug: false,
	showBroadphase: false,
	showBounds: false,
	// 速度の可視化
	showVelocity: false,
	// しょう突の可視化
	showCollisions: false,
	// 分離の可視化
	showSeparations: false,
	// 軸の可視化
	showAxes: false,
	// 位置の可視化
	showPositions: false,
	// 角度の可視化
	showAngleIndicator: false,
	// ID の可視化
	showIds: false,
	showShadows: false,
	showVertexNumbers: false,
	showConvexHulls: false,
	showInternalEdges: false,
	showMousePosition: false,
	// ピクセル倍率
	pixelRatio: 1,
};

// create a renderer
export default Render.create({
	element: document.body,
	engine,
	options,
});

export const createRender = (opt) => Render.create({
	element: document.body,
	engine,
	options: {...options, ...opt},
});

