import en_text from 'raw-loader!feeles/blocks_en.dropdown.yml';
import ja_text from 'raw-loader!feeles/blocks_ja.dropdown.yml';


export const events = {
	broken: 'こわれた',
	placed: 'おかれた',

	died: 'やられた',

	travelled: 'うごいた'
};

export const synonyms = {};
export const reversed = {};

const parse = text => text.split('\n')
	// s ===`  - body: "'air'"`
	.map(s => s.substring(s.indexOf("'") + 1, s.lastIndexOf("'")));

const en = parse(en_text);
const ja = parse(ja_text);

for (const [i, value] of en.entries()) {
	if (value) {
		const synonym = ja[i];
		synonyms[synonym] = value;
		reversed[value] = synonym;
	}
}
