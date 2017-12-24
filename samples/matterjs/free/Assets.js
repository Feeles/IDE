import {
	World,
	Bodies,
	Render,
	Engine,
} from 'matter';


import engine from 'engine';
import render from 'render';


// run the engine
Engine.run(engine);

// run the renderer
Render.run(render);


const Assets = {};

Object.keys(Bodies).forEach((shape) => {

	Assets[shape] = (...args) => {
		const self = Bodies[shape](...args);
		World.add(engine.world, self);
		return Promise.resolve(self);
	};

	Assets[shape + 'Sync'] = (...args) => {
		const self = Bodies[shape](...args);
		World.add(engine.world, self);
		return self;
	};

});

export default Assets;

