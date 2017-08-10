import { events } from './synonyms';

class MinecraftEventEmitter extends EventEmitter2 {

	emit(name, ...args) {

		const onName = 'on' + name[0].toUpperCase() + name.substr(1);
		const synonym = events[name];
		const onSynonym = 'on' + synonym;

		if (onName in this) {
			this[onName](...args);
		}
		super.emit(name, ...args);

		if (synonym) {
			if (onSynonym in this) {
				this[onSynonym](...args);
			}
			super.emit(synonym, ...args);
		}

	}

};

export default MinecraftEventEmitter;
