import blockNames from './block-names';

import MinecraftBlockManager from './block-manager';
import MinecraftEventEmitter from './event-emitter';

import MinecraftPlayer from './player';
import MinecraftAgent from './agent';

import * as utils from './utils';
import { synonyms } from './synonyms';
const $t = word => synonyms[word] || word;


class Minecraft extends MinecraftEventEmitter {

	constructor() {
		super();

		this.utils = utils;

		// API のバージョン
		this.version = 1;

		// リクエスト ID
		this.id = 0;


		this.requestSubscribe('PlayerMessage');
		this.requestSubscribe('PlayerTravelled');

		this.requestSubscribe('BlockPlaced');
		this.requestSubscribe('BlockBroken');

		this.requestSubscribe('PlayerDied');

		this.blocks = {};


		this.listeners = {};

		this.player = new MinecraftPlayer();

		this.agent = new MinecraftAgent(this);


		this.on('BlockPlaced', (data) => {

			const type = data.body.properties.Type;
			const blockName = blockNames[type];

			this.blocks[blockName].emit('placed', {


			});

		});


		this.colors = [
			'white',
			'orange',
			'magenta',
			'lightblue',
			'yellow',
			'lime',
			'pink',
			'gray',
			'lightgray',
			'cyan',
			'purple',
			'blue',
			'brown',
			'green',
			'red',
			'black'
		];

		this.directions = [
			'forward',
			'back',
			'left',
			'right',
			'up',
			'down'
		];

		this.turnDirections = [
			'left',
			'right'
		];


		this.on('BlockBroken', (data) => {

			const type = data.body.properties.Type;
			const blockName = blockNames[type];


			this.blocks[blockName].emit('broken', {


			});

		});


		this.on('PlayerDied', (data) => {

			this.player.emit('died', {

			});

		});

		this.on('PlayerTravelled', (data) => {

			this.player.emit('travelled', {

			});

		});


		for (const key of Object.keys(blockNames)) {
			const blockName = blockNames[key];
			this.blocks[blockName] = new MinecraftBlockManager(blockName, this);
		}


		feeles.ipcRenderer.on('responseFromApp', (sender, data) => {

			data = JSON.parse(data);

			// イベントが送られてきたら
			if (data.header.messagePurpose === 'event') {

				const {
					eventName
				} = data.body;
				this.emit(eventName, data);

			}

			if (data.header.messagePurpose === 'commandResponse') {

				const id = data.header.requestId;

				if (id in this.listeners) {
					this.listeners[id](data);
					delete this.listeners[id];
				}

			}

		});

	}


	createTargetData(name, selector = 'allPlayers') {
		return {
			rules: [{
				name: 'name',
				value: name
			}],
			selector
		};
	}


	send(purpose, type, body, idv = 0) {

		const id = this.id++;

		feeles.ipcRenderer.sendToHost('sendToApp', {
			body,
			header: {
				messagePurpose: purpose,
				messageType: type,
				requestId: id.toString(),
				version: this.version
			}
		});

		return new Promise((resolve) => {
			this.listeners[id] = resolve;
		});
	}


	requestSubscribe(eventName) {
		this.send('subscribe', 'commandRequest', {
			eventName
		});
	}


	commandRequest(body) {

		body = Object.assign({

			origin: {},
			overload: 'default',
			version: this.version

		}, body);

		return this.send(
			'commandRequest',
			'commandRequest',
			body
		);
	}





	getPos(x, y, z, relative = true) {
		return {
			x,
			xrelative: relative,
			y,
			yrelative: relative,
			z,
			zrelative: relative,
		};
	}

	locate(x, y, z, relative) {
		this.send('commandRequest', 'commandRequest', {
			name: 'tp',
			input: {
				destination: this.getPos(x, y, z, relative)
			},
			origin: {
				type: 'player'
			},
			overload: 'selfToPos',
			version: this.version
		});
	}

	locateTo(x, y, z) {
		this.locate(x, y, z, false);
	}

	locateBy(x, y, z) {
		this.locate(x, y, z, true);
	}


	setBlock(_name, x, y, z, relative = true) {

		const [name, tileData] = $t(_name).split(':');

		this.send('commandRequest', 'commandRequest', {
			name: 'setblock',
			input: {
				position: this.getPos(x, y, z, relative),
				tileData: tileData | 0,
				tileName: name
			},
			origin: {
				type: 'player'
			},
			overload: 'default',
			version: this.version
		});
	}



	fill(name, x1, y1, z1, x2, y2, z2, relative = true, oldBlockHandling = 'destroy') {

		const [tileName, tileData] = $t(name).split(':');

		return this.commandRequest({
			name: 'fill',
			input: {
				from: this.getPos(x1, y1, z1, relative),
				to: this.getPos(x2, y2, z2, relative),
				tileName,
				tileData,
				oldBlockHandling
			}
		});


	}


	replace(name, old, x1, y1, z1, x2, y2, z2) {

		const [tileName1, tileData1] = $t(name).split(':');
		const [tileName2, tileData2] = $t(old).split(':');

		this.execute(`fill ~${x1} ~${y1} ~${z1} ~${x2} ~${y2} ~${z2} ${tileName1} ${tileData1 | 0} replace ${tileName2} ${tileData2 | 0}`);


	}


	summon(entity, x, y, z, relative = true) {
		return this.commandRequest({
			name: 'summon',
			input: {
				entityType: $t(entity),
				spawnPos: this.getPos(x, y, z, relative)
			}
		});
	}

	async gamemode(gameMode) {

		const name = await this.getPlayerName();

		return this.commandRequest({
			name: 'gamemode',
			input: {
				gameMode,
				player: this.createTargetData(name)
			},
			overload: 'byName'
		});

	}



	async getPlayerName() {

		if (this.name) return this.name;

		const data = await this.commandRequest({
			name: 'getlocalplayername'
		});

		const name = this.name = data.body.localplayername;

		return name;

	};


	kill(name, selector = 'allPlayers') {
		this.send('commandRequest', 'commandRequest', {
			name: 'execute',
			input: {
				command: `kill`,
				origin: {
					rules: [{
						name: 'name',
						value: name
					}],
					selector
				},
				position: this.getPos(0, 0, 0),
			},
			origin: {
				type: 'player'
			},
			overload: 'asOther',
			version: this.version
		});
	}


	async getSpawnPoint() {

		const name = await this.getPlayerName();

		return this.send('commandRequest', 'commandRequest', {
			name: 'getspawnpoint',
			input: {
				player: this.createTargetData(name)
			},
			origin: {},
			overload: 'default',
			version: this.version
		});
	}

	async getChunks() {

		return this.send('commandRequest', 'commandRequest', {
			name: 'getchunks',
			input: {
				dimension: 'overworld'
			},
			origin: {},
			overload: 'default',
			version: this.version
		});

	}

	async getChunkData(chunkX, chunkZ, height, dimension = 'overworld') {

		return this.send('commandRequest', 'commandRequest', {
			name: 'getchunkdata',
			input: {
				chunkX,
				chunkZ,
				height,
				dimension
			},
			origin: {},
			overload: 'default',
			version: this.version
		});

	}


	async execute(command) {


		// execute するときは最初の / がいらない
		if (command[0] === '/') command = command.substr(1);


		const name = await this.getPlayerName();

		return this.send('commandRequest', 'commandRequest', {
			name: 'execute',
			input: {
				command,
				origin: {
					rules: [{
						name: 'name',
						value: name
					}],
					selector: 'allPlayers'
				},
				position: this.getPos(0, 0, 0),
			},
			origin: {
				type: 'player'
			},
			overload: 'asOther',
			version: this.version
		});
	}


	async give(item, amount) {
		const [name, tileData] = $t(item).split(':');
		return await this.execute(`give @p ${name} ${amount} ${tileData | 0}`);
	}



	async say(text) {
		return await this.execute(`say ${text}`);
	}


	setTime(time) {
		this.send('commandRequest', 'commandRequest', {
			name: 'time set',
			input: {
				time
			},
			origin: {
				type: 'player'
			},
			overload: 'byNumber',
			version: this.version
		});
	}


	async title(text, type = 'title') {

		const name = await this.getPlayerName();

		const data = {
			name: 'title',
			input: {
				player: this.createTargetData(name),
				titleText: text.toString()
			},
			overload: type
		};

		data.input[type] = type;


		return this.commandRequest(data);
	}


	difficulty(difficulty) {
		return this.commandRequest({
			name: 'difficulty',
			input: {
				difficulty
			},
			overload: 'byName'
		});
	}


}

export default Minecraft;
