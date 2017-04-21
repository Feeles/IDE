import {
	Engine,
	Grid,
} from 'matter.js';

// create an engine
export default Engine.create({
	positionIterations: 6,
	velocityIterations: 4,
	constraintIterations: 2,
	enableSleeping: true,
	events: [],
	timing: {
		timestamp: 0,
		timeScale: 1
	},
	broadphase: {
		controller: Grid
	}
});
