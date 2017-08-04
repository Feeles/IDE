import 'hackforplay/rpg-kit-main';
import 'enchantjs/enchant';
import 'enchantjs/ui.enchant';
import 'hackforplay/hack';
import * as synonyms from 'hackforplay/synonyms';

const RPGObject = enchant.Class.create(enchant.Sprite, {

	initialize(width, height, offsetX, offsetY) {
		Sprite.call(this, width || 0, height || 0);
		this.offset = {
			x: offsetX || 0,
			y: offsetY || 0
		};

		this.speed = 1.0;

		// マップの端に衝突判定があると見なすか
		// false ならマップ外を歩ける
		this.collideMapBoader = true;

		// 衝突した Node リスト
		this._collidedNodes = [];

		this.moveTo(game.width, game.height);

		Object.defineProperty(this, 'mapX', {
			configurable: true,
			enumerable: true,
			get: function() {
				return (this.x - this.offset.x + 16) / 32 >> 0;
			}
		});
		Object.defineProperty(this, 'mapY', {
			configurable: true,
			enumerable: true,
			get: function() {
				return (this.y - this.offset.y + 16) / 32 >> 0;
			}
		});
		Object.defineProperty(this, 'map', {
			configurable: true,
			enumerable: true,
			get: function() {
				return this.parentNode ? this.parentNode.ref : null;
			}
		});
		var collisionFlag = null; // this.collisionFlag (Default:true)
		var noCollisionEvents = ['playerenter', 'playerstay', 'playerexit'];
		Object.defineProperty(this, 'collisionFlag', {
			configurable: true,
			enumerable: true,
			get: function() {
				if (collisionFlag !== null) return collisionFlag;
				for (var i = 0; i < noCollisionEvents.length; i++) {
					if (this.isListening(noCollisionEvents[i])) {
						return false;
					}
				}
				return true;
			},
			set: function(value) {
				collisionFlag = value;
			}
		});
		var isKinematic = null; // this.isKinematic (Default: true)
		Object.defineProperty(this, 'isKinematic', {
			configurable: true,
			enumerable: true,
			get: function() {
				return isKinematic !== null ? isKinematic :
					!(this.velocityX || this.velocityY ||
						this.accelerationX || this.accelerationY);
			},
			set: function(value) {
				isKinematic = value;
			}
		});
		// Destroy when dead
		this.on('becomedead', function() {
			this.setTimeout(function() {
				this.destroy();
			}, this.getFrame().length);
		});
		this.on('hpchange', function() {
			if (this.hp <= 0) {
				this.behavior = BehaviorTypes.Dead;
			}
		});

		// direction
		this._forward = {
			x: 0,
			y: 0
		};
		this.directionType = null;
		Object.defineProperty(this, 'direction', {
			configurable: true,
			enumerable: true,
			get: this.getDirection,
			set: this.setDirection
		});
		Object.defineProperty(this, 'forward', {
			configurable: true,
			enumerable: true,
			get: this.getForward,
			set: this.setForward
		});

		// 初期化
		this.velocityX = this.velocityY = this.accelerationX = this.accelerationY = 0;
		this.mass = 1;
		this.damageTime = 0;
		this.attackedDamageTime = 30; // * 1/30sec
		this.hpchangeFlag = false;
		this.on('enterframe', this.geneticUpdate);
		this.getFrameOfBehavior = {}; // BehaviorTypesをキーとしたgetterのオブジェクト
		this.behavior = BehaviorTypes.Idle; // call this.onbecomeidle
		this._layer = RPGMap.Layer.Middle;

		Hack.defaultParentNode.addChild(this);
	},



	geneticUpdate() {
		if (!Hack.isPlaying) return;
		// enter frame
		if (typeof this.hp === 'number') {
			this.damageTime = Math.max(0, this.damageTime - 1);
			if (this.damageTime > 0) {
				this.opacity = (this.damageTime / 2 + 1 | 0) % 2; // 点滅
			}
		}
		if (this.hpchangeFlag) {
			this.dispatchEvent(new Event('hpchange'));
			this.hpchangeFlag = false;
		}
		if (this.isBehaviorChanged) {
			// begin animation
			var routine = this.getFrameOfBehavior[this.behavior];
			if (routine) this.frame = routine.call(this);
			// becomeイベント内でbehaviorが変更された場合、
			// 次のフレームで１度だけbecomeイベントが発火します。
			this.isBehaviorChanged = false;
			this.dispatchEvent(new Event('become' + this.behavior));
		}
	},

	locate(fromLeft, fromTop, mapName) {
		if (mapName in Hack.maps &&
			Hack.maps[mapName] instanceof RPGMap &&
			this.map !== Hack.maps[mapName]) {
			// this.destroy();
			Hack.maps[mapName].scene.addChild(this);
		}
		this.moveTo(
			fromLeft * 32 + this.offset.x,
			fromTop * 32 + this.offset.y);
	},

	destroy(delay) {
		if (delay > 0) this.setTimeout(_remove.bind(this), delay);
		else _remove.call(this);

		function _remove() {
			this.remove();
			if (this.shadow) this.shadow.remove();
		}
	},

	setFrame(behavior, frame) {
		// behavior is Type:string
		// frame is Frames:array or Getter:function
		(function(_local) {
			if (typeof frame === 'function') {
				this.getFrameOfBehavior[behavior] = _local;
			} else {
				this.getFrameOfBehavior[behavior] = function() {
					return _local;
				};
			}
		}).call(this, frame);
	},

	getFrame() {
		if (this.getFrameOfBehavior[this.behavior] instanceof Function) {
			return this.getFrameOfBehavior[this.behavior].call(this);
		}
		return [];
	},




	setTimeout(callback, wait, timing = 'enterframe') {
		var target = this.age + Math.max(1, wait),
			flag = true;

		function task() {
			if (this.age === target && flag) {
				callback.call(this);
				stopTimeout.call(this);
			}
		}

		function stopTimeout() {
			flag = false;
			this.removeEventListener(timing, task);
		}
		this.on(timing, task);
		return stopTimeout.bind(this);
	},

	setInterval(callback, interval) {
		var current = this.age,
			flag = true;

		let count = 0;

		function task() {
			if ((this.age - current) % interval === 0 && flag) {
				callback.call(this, ++count);
			}
		}

		function stopInterval() {
			flag = false;
			this.removeEventListener('enterframe', task);
		}
		this.on('enterframe', task);
		return stopInterval.bind(this);
	},


	async attack() {
		if (this.behavior !== BehaviorTypes.Idle || !Hack.isPlaying) return;
		var f = this.forward;
		this.behavior = BehaviorTypes.Attack;
		Hack.Attack.call(this, this.mapX + f.x, this.mapY + f.y, this.atk, f.x, f.y);

		await new Promise((resolve) => {
			this.setTimeout(resolve, this.getFrame().length);
		});

		this.behavior = BehaviorTypes.Idle;
	},


	onattacked(event) {
		if (!this.damageTime && typeof this.hp === 'number') {
			this.damageTime = this.attackedDamageTime;
			this.hp -= event.damage;
		}

	},



	async walk(distance = 1, forward = null, setForward = true) {

		if (!Hack.isPlaying) return;
		if (!this.isKinematic) return;
		if (this.behavior !== BehaviorTypes.Idle) return;

		if (forward && setForward) this.forward = forward;

		// 距離が 1 以下
		if (distance < 1) return;

		distance = Math.round(distance);

		// distance 回歩く
		for (let i = 0; i < distance; ++i) {

			await this.walkImpl(forward || this.forward);

		}

	},



	async walkImpl(forward) {

		// タイルのサイズ
		const tw = Hack.map.tileWidth;
		const th = Hack.map.tileHeight;

		// マップのタイル数
		const tx = Hack.map.tileNumX;
		const ty = Hack.map.tileNumY;

		// 移動先
		const nextX = this.mapX + forward.x;
		const nextY = this.mapY + forward.y;

		let isHit = Hack.map.hitTest(nextX * tw, nextY * th);

		// 画面外
		if (nextX < 0 || nextX >= tx || nextY < 0 || nextY >= ty) {

			// 画面外なら歩かない
			if (this.collideMapBoader) return;
			// 画面外に判定はない
			else isHit = false;

		}

		// 歩く先にあるオブジェクト
		const hits = RPGObject.collection
			.filter((obj) => {
				return obj.isKinematic &&
					obj.collisionFlag &&
					obj.mapX === nextX &&
					obj.mapY === nextY;
			});

		// 初めて衝突したオブジェクト
		const newHits = hits.filter((node) => {
			return !this._collidedNodes.includes(node);
		});
		this._collidedNodes.push(...newHits);

		// 衝突イベント（仮）
		const event = new enchant.Event('collided');
		// event.map = false;
		// event.hit = this;
		// event.hits = [this];
		this.dispatchEvent(event);
		newHits.forEach((hitObj) => {
			hitObj.dispatchEvent(event);
		});

		// 障害物があるので歩けない
		if (isHit || hits.length) return;

		// 速度が 0.0 以下なら歩けない
		if (this.speed <= 0.0) return;

		// 歩く
		this.behavior = BehaviorTypes.Walk;
		this.dispatchEvent(new enchant.Event('walkstart'));

		// 衝突リストを初期化
		this._collidedNodes = [];

		const animation = [...this.getFrame()];
		// 最後に null が入っているので削除
		animation.pop();

		// 1F の移動量
		let move = 1.0 / (animation.length);

		// 移動量に速度をかける
		move *= this.speed;

		// 1 マス移動するのにかかるフレーム数
		// 最速でも 1 フレームはかかるようになっている
		const endFrame = Math.ceil(1.0 / move);

		// 移動開始座標
		const beginX = this.x;
		const beginY = this.y;


		for (let frame = 1; frame <= endFrame; ++frame) {

			// アニメーション番号を算出
			this.frame = animation[Math.round(animation.length / endFrame * frame)];

			const x = beginX + move * tw * frame * forward.x;
			const y = beginY + move * th * frame * forward.y;

			// 移動
			this.moveTo(x, y);

			this.dispatchEvent(new enchant.Event('walkmove'));


			// 最終フレームなら待たない
			if (frame === endFrame) break;

			await new Promise((resolve) => {
				this.setTimeout(resolve, 1);
			});

		}

		// 移動の誤差を修正
		this.x = beginX + tw * forward.x;
		this.y = beginY + th * forward.y;

		this.dispatchEvent(new Event('walkend'));

		this.behavior = BehaviorTypes.Idle;

	},



	// 旧 walk
	_walk: function(distance, continuous) {
		if (!this.isKinematic || !continuous && this.behavior !== BehaviorTypes.Idle || !Hack.isPlaying) return;
		this.behavior = BehaviorTypes.Walk;
		var f = this.forward,
			d = typeof distance === 'number' ? distance >> 0 : 1,
			s = Math.sign(d);
		var _x = this.mapX + f.x * s,
			_y = this.mapY + f.y * s,
			tw = Hack.map.tileWidth,
			th = Hack.map.tileHeight;
		// Map Collision
		var mapR = Hack.map.width / tw - 1,
			mapB = Hack.map.height / th - 1;
		var mapHit = Hack.map.hitTest(_x * tw, _y * th) || 0 > _x || _x > mapR || 0 > _y || _y > mapB;
		// RPGObject(s) Collision
		var hits = RPGObject.collection.filter(function(item) {
			return item.isKinematic && item.collisionFlag && item.mapX === _x && item.mapY === _y;
		});
		if (!mapHit && !hits.length) {
			if (continuous) {
				this.frame = [];
				this.frame = this.getFrame();
			} else this.behavior = BehaviorTypes.Walk;
			this.dispatchEvent(new Event('walkstart'));
			var move = {
				x: Math.round(f.x * tw * s),
				y: Math.round(f.y * th * s)
			};
			var target = {
				x: this.x + move.x,
				y: this.y + move.y
			};
			var frame = this.getFrame().length;
			var stopInterval = this.setInterval(function() {
				this.moveBy(move.x / frame, move.y / frame);
				this.moveTo(Math.round(this.x), Math.round(this.y));
				this.dispatchEvent(new Event('walkmove'));
			}, 1);
			this.setTimeout(function() {
				this.moveTo(target.x, target.y);
				stopInterval();
				this.dispatchEvent(new Event('walkend'));
				// next step
				if (Math.abs(d) > 1) this.walk(Math.sign(d) * (Math.abs(d) - 1), true);
				else this.behavior = BehaviorTypes.Idle;
			}, frame - 1);
		} else {
			// 直前のフレームで collided していたオブジェクトを除外
			var e = new Event('collided');
			e.map = mapHit;
			e.hits = hits.filter(function(item) {
				return !this._preventFrameHits || this._preventFrameHits.indexOf(item) < 0;
			}, this);
			e.hit = e.hits.length > 0 ? e.hits[0] : undefined;
			if (e.hit || e.map) {
				var e2 = new Event('collided');
				e2.map = false;
				e2.hits = [e2.hit = this];
				this.dispatchEvent(e);
				e.hits.forEach(function(item) {
					item.dispatchEvent(e2);
				});
			}
			this.behavior = BehaviorTypes.Idle;
		}
		this._preventFrameHits = hits;
	},



	velocity: function(x, y) {
		this.velocityX = x;
		this.velocityY = y;
	},
	force: function(x, y) {
		this.accelerationX = x / this.mass;
		this.accelerationY = y / this.mass;
	},
	hp: {
		get() {
			return this._hp;
		},
		set(value) {
			if (typeof value === 'number' && !isNaN(value) && value !== this._hp) {
				this.hpchangeFlag = true;
				this._hp = value;
			}
		}
	},
	behavior: {
		get: function() {
			return this._behavior;
		},
		set: function(value) {
			if (typeof value === 'string') {
				this.isBehaviorChanged = true;
				this._behavior = value;
			}
		}
	},
	layer: {
		get: function() {
			return this._layer;
		},
		set: function(value) {
			if (this === Hack.player) return this._layer; // プレイヤーのレイヤー移動を禁止
			if (value === this._layer) return this._layer;

			// Range of layer
			var sortingOrder = Object.keys(RPGMap.Layer).map(function(key) {
				return RPGMap.Layer[key];
			});
			var max = Math.max.apply(null, sortingOrder);
			var min = Math.min.apply(null, sortingOrder);
			this._layer = Math.max(Math.min(value, max), min);

			// 他オブジェクトはプレイヤーレイヤーに干渉できないようにする
			if (this._layer === RPGMap.Layer.Player) {
				switch (Math.sign(value - this._layer)) {
					case 1:
						return this.bringOver();
					case -1:
						return this.bringUnder();
					default:
						break;
				}
			}

			this.map.layerChangeFlag = true; // レイヤーをソートする
		}
	},
	bringOver: function() {
		// 現在のレイヤーより大きいレイヤーのうち最も小さいもの
		var uppers = Object.keys(RPGMap.Layer).map(function(key) {
			return RPGMap.Layer[key];
		}, this).filter(function(layer) {
			return layer > this.layer;
		}, this);
		this.layer = uppers.length > 0 ? Math.min.apply(null, uppers) : this.layer;
		return this.layer;
	},
	bringUnder: function() {
		// 現在のレイヤーより小さいレイヤーのうち最も大きいもの
		var unders = Object.keys(RPGMap.Layer).map(function(key) {
			return RPGMap.Layer[key];
		}, this).filter(function(layer) {
			return layer < this.layer;
		}, this);
		this.layer = unders.length > 0 ? Math.max.apply(null, unders) : this.layer;
		return this.layer;
	},
	shoot(node, vector, speed) {
		node.collisionFlag = false;

		// 置くだけ
		if (arguments.length === 1) {
			return node.locate(this.mapX, this.mapY);
		}

		// 配列ならベクトル化
		if (Array.isArray(vector)) {
			vector = {
				x: vector[0],
				y: vector[1]
			};
		}

		// 正規化
		var length = Math.pow(vector.x, 2) + Math.pow(vector.y, 2);
		if (length > 0) length = 1 / length;
		vector = {
			x: vector.x * length,
			y: vector.y * length
		};

		node.locate(Math.round(this.mapX + vector.x), Math.round(this.mapY + vector.y));

		// 速度をかける
		speed = arguments.length < 3 ? 1 : speed;
		vector.x *= speed;
		vector.y *= speed;
		node.velocity(vector.x, vector.y);

		var angle = 0;

		// 対象が MapObject かつベクトルの長さが 0.0 より大きいなら
		if ((node instanceof MapObject || node.directionType === 'single') &&
			!(vector.x === 0 && vector.y === 0)) {
			angle = 90 - Math.atan2(-vector.y, vector.x) * 180 / Math.PI;
		}

		// 速度がマイナスなら角度はそのままにする
		if (speed < 0) angle += 180;

		node._rotation = angle;

		return this;
	},

	mod: function(func) {
		func.call(this);
	},
	getForward: function() {
		return {
			x: this._forward.x,
			y: this._forward.y
		};
	},
	setForward: function(value) {
		var vec =
			value instanceof Array ? {
				x: value[0],
				y: value[1]
			} :
			'x' in value && 'y' in value ? {
				x: value.x,
				y: value.y
			} :
			this._forward;
		var norm = Math.sqrt(vec.x * vec.x + vec.y * vec.y);
		if (norm > 0) {
			this._forward = {
				x: vec.x / norm,
				y: vec.y / norm
			};
		}
		switch (this.directionType) {
			case 'single':
				var rad = Math.atan2(this._forward.y, this._forward.x);
				var enchantRot = rad / Math.PI * 180 + 90; // 基準は上,時計回りの度数法
				this.rotation = (enchantRot + 360) % 360;
				break;
			case 'double':
				if (this._forward.x !== 0) {
					this.scaleX = -Math.sign(this._forward.x) * Math.abs(this.scaleX);
				}
				break;
			case 'quadruple':
				var dir = Hack.Vec2Dir(this._forward);
				this.frame = [dir * 9 + (this.frame % 9)];
				break;
		}
	},
	getDirection: function() {
		switch (this.directionType) {
			case 'double':
				return this.forward.x;
			case 'quadruple':
				return Hack.Vec2Dir(this.forward);
		}
	},
	setDirection: function(value) {
		switch (this.directionType) {
			case 'double':
				this.forward = [Math.sign(value) || -1, 0];
				return;
			case 'quadruple':
				this.forward = Hack.Dir2Vec(value);
				break;
		}
	},
	setFrameD9: function(behavior, frame) {
		var array = typeof frame === 'function' ? frame() : frame;

		this.setFrame(behavior, function() {
			var _array = [];
			array.forEach(function(item, index) {
				_array[index] = item !== null && item >= 0 ? item + this.direction * 9 : item;
			}, this);
			return _array;
		});
	},
	turn: function(count) {
		var c, i;
		switch (this.directionType) {
			case 'double':
				c = typeof count === 'number' ? Math.ceil(Math.abs(count / 2)) : 1;
				i = {
					'-1': 1,
					'1': 0
				}[this.direction] + c; // direction to turn index
				this.direction = [1, -1, -1, 1][i % 2]; // turn index to direction
				break;
			case 'quadruple':
				c = typeof count === 'number' ? count % 4 + 4 : 1;
				i = [3, 2, 0, 1][this.direction] + c; // direction to turn index
				this.direction = [2, 3, 1, 0][i % 4]; // turn index to direction
				break;
		}
	},
	dispatchEvent: function(event) {
		EventTarget.prototype.dispatchEvent.call(this, event);
		// Synonym Event を発火
		var synonym = synonyms.events[event.type];
		if (synonym) {
			var clone = Object.assign({}, event, {
				type: synonym
			});
			EventTarget.prototype.dispatchEvent.call(this, clone);
		}
	},
	isListening: function(eventType) {
		// eventType のリスナーを持っているか
		var synonym = synonyms.events[eventType];
		return this['on' + eventType] || this._listeners[eventType] ||
			synonym && (this['on' + synonym] || this._listeners[synonym]);
	},
	start: function (virtual) {
		let count = 0;
		const override = async () => {
			// １フレームだけディレイを入れる
			await this.wait();
			// count をインクリメントして同じ関数をコール
			return virtual(this, ++count, override);
		};
		// 初回のみ即座にコール
		virtual(this, count, override);
	},
	wait: function (second = 0) {
		return new Promise((resolve, reject) => {
			this.setTimeout(resolve, second * game.fps);
		});
	},
	endless: async function (virtual) {
		if (!this._endless) {
			// ルーチンをスタート
			let count = 0;
			this._endless = virtual;
			// this._endless が空で上書きされたときストップ
			while (this._endless) {
				// つねに this._endless をコールし続ける
				await this._endless(this, count++);
				// 安全ディレイ
				await this.wait();
			}
		} else {
			// 次回呼ぶ関数を上書き (フラグの役割を兼ねている)
			this._endless = virtual;
		}
	}
});


export default RPGObject;
