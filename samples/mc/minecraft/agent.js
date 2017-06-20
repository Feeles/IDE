import MinecraftEventEmitter from './event-emitter';

class MinecraftAgent extends MinecraftEventEmitter {

	constructor(mc) {
		super();
		this.mc = mc;


		mc.on('AgentCommand', (event) => {
			const name = event.body.properties.Result.commandName;
			this.emit(`result-${name}`, event);
		});

	}


	getResult(name) {
		return new Promise((resolve) => {
			this.on(`result-${name}`, (result) => {
				resolve(result);
			});
		});
	}


	async commandRequestDelay(request, delay) {

		const response = await this.mc.commandRequest(request);

		await this.mc.utils.wait(delay);

		return response;

	}



	/**
	 * @param direction String
	 */
	async move(direction, wait = 200) {
		return this.commandRequestDelay({
			name: 'move',
			input: {
				direction
			}
		}, wait);
	}

	/**
	 * @param direction String
	 */
	async turn(direction, wait = 100) {
		return this.commandRequestDelay({
			name: 'turn',
			input: {
				direction
			}
		}, wait);
	}

	/**
	 * @param direction String
	 */
	attack(direction) {
		return this.mc.commandRequest({
			name: 'attack',
			input: {
				direction
			}
		});
	}

	/**
	 * @param direction String
	 */
	destroy(direction) {
		return this.mc.commandRequest({
			name: 'destroy',
			input: {
				direction
			}
		});
	}

	drop(slotNum, quantity, direction) {
		return this.mc.commandRequest({
			name: 'drop',
			input: {
				slotNum,
				quantity,
				direction
			}
		});
	}

	dropAll(direction) {
		return this.mc.commandRequest({
			name: 'dropall',
			input: {
				direction
			}
		});
	}

	async inspect(direction) {

		const response = await this.mc.commandRequest({
			name: 'inspect',
			input: {
				direction
			}
		});

		const result = await this.getResult('inspect');

		return result.body.properties.Result;

	}

	async inspectData(direction) {

		const response = await this.mc.commandRequest({
			name: 'inspectdata',
			input: {
				direction
			}
		});

		const result = await this.getResult('inspectdata');

		return result.body.properties.Result;

	}

	async detect(direction) {

		const response = await this.mc.commandRequest({
			name: 'detect',
			input: {
				direction
			}
		});

		const result = await this.getResult('detect');

		return result.body.properties.Result;

	}

	async detectRedstone(direction) {

		const response = await this.mc.commandRequest({
			name: 'detectredstone',
			input: {
				direction
			}
		});

		const result = await this.getResult('detectredstone');

		return result.body.properties.Result;

	}


	transfer(srcSlotNum, quantity, dstSlotNum) {
		return this.mc.commandRequest({
			name: 'transfer',
			input: {
				srcSlotNum,
				quantity,
				dstSlotNum
			}
		});
	}

	create() {
		return this.mc.commandRequest({
			name: 'createagent'
		});
	}



	tp() {
		return this.mc.commandRequest({
			name: 'tpagent'
		});
	}

	collect(item) {
		return this.mc.commandRequest({
			name: 'collect',
			input: {
				item
			}
		});
	}

	till(direction) {
		return this.mc.commandRequest({
			name: 'till',
			input: {
				direction
			}
		});
	}

	place(slotNum, direction) {
		return this.mc.commandRequest({
			name: 'place',
			input: {
				slotNum,
				direction
			}
		});
	}


	async getItemCount(slotNum) {

		const response = await this.mc.commandRequest({
			name: 'getitemcount',
			input: {
				slotNum
			}
		});

		const result = await this.getResult('getitemcount');

		return result.body.properties.Result;

	}

	async getItemSpace(slotNum) {

		const response = await this.mc.commandRequest({
			name: 'getitemspace',
			input: {
				slotNum
			}
		});

		const result = await this.getResult('getitemspace');

		return result.body.properties.Result;

	}


	async getItemDetail(slotNum) {

		const response = await this.mc.commandRequest({
			name: 'getitemdetail',
			input: {
				slotNum
			}
		});

		const result = await this.getResult('getitemdetail');

		return result.body.properties.Result;

	}





}

export default MinecraftAgent;
