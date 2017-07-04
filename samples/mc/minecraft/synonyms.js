export const events = {
	broken: 'こわれた',
	placed: 'おかれた',

	died: 'やられた',

	travelled: 'うごいた'
};

export const synonyms = {};

const tryParse = async loc => {
	try {
		const result = await feeles.fetch(`feeles/blocks_${loc}.dropdown.yml`);
		const yaml = await result.text();
		return yaml.split('\n')
			// s ===`  - body: "'air'"`
			.map(s => s.substring(s.indexOf("'") + 1, s.lastIndexOf("'")));
	} catch (e) {
		return [];
	}
};

(async () => {

	const en = await tryParse('en');
	const ja = await tryParse('ja');

	for (const [i, value] of en.entries()) {
		if (value) {
			const synonym = ja[i];
			synonyms[synonym] = value;
		}
	}

})();
