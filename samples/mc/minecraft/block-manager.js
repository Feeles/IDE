import Minecraft from './core';
import MinecraftEventEmitter from './event-emitter';

class MinecraftBlockManager extends MinecraftEventEmitter {

	constructor(name, minecraftInstance) {
		super();

		this.name = name;
		this.minecraftInstance = minecraftInstance;

	}


	put(x, y, z, relative = true) {

		this.minecraftInstance.setBlock(this.name, x, y, z, relative);

	}

}

export default MinecraftBlockManager;
