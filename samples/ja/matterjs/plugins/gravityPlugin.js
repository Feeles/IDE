// NOTE: this plugin will be moved to its own repo

import {
	Plugin,
	Vector,
	Body,
} from 'matter';


const MatterGravity = {
	name: 'matter-gravity',

	version: '0.1.0',

	for: 'matter-js@^0.10.0',

	uses: [
		'matter-attractors@^0.1.0'
	],

	install: function(base) {
		base.after('Body.create', function() {
			MatterGravity.Body.init(this);
		});
	},

	Body: {
		init: function(body) {
			if (body.plugin.gravity) {
				body.attractors.push(MatterGravity.Body.applyGravity);
			}
		},

		applyGravity: function(bodyA, bodyB) {
			var bToA = Vector.sub(bodyB.position, bodyA.position),
				distanceSq = Vector.magnitudeSquared(bToA) || 0.0001,
				normal = Vector.normalise(bToA),
				magnitude = -bodyA.plugin.gravity * (bodyA.mass * bodyB.mass / distanceSq),
				force = Vector.mult(normal, magnitude);

			Body.applyForce(bodyA, bodyA.position, Vector.neg(force));
			Body.applyForce(bodyB, bodyB.position, force);
		}
	}
};

Plugin.register(MatterGravity);

window.MatterGravity = MatterGravity;
