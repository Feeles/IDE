import synonyms from './synonyms';

class MinecraftEventEmitter extends EventEmitter2 {

	emit(name, ...args) {

		const onName = 'on' + name[0].toUpperCase() + name.substr(1);
		const synonym = synonyms[name];
		const onSynonym = 'on' + synonym;

		if (onName in this) {
			this[onName](...args);
		}

		super.emit(name, ...args);

		if (synonym) {
			super.emit(synonym, ...args);
		}

	}

};

export default MinecraftEventEmitter;
