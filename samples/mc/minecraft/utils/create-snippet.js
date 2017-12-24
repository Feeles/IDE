export default async function createSnippet() {

	const response = await feeles.fetch('minecraft/data/ja_JP.lang.txt');
	const text = await response.text();


	const data = {};

	text.split('\n')
		.map((line) => line.split('='))
		.forEach(([key, value]) => {
			/*
							名前を整形する
							例: "item.apple.name=リンゴ	#"
						*/
			if (value && value.endsWith('#')) {
				value = value.substr(0, value.length - 1).trim();
			}

			data[key] = value;


		});





	// ブロック一覧
	const json = {
		'.source.js': {

		}
	};

	const colors = [
		['白の', 'white'],
		['オレンジの', 'orange'],
		['赤紫の', 'magenta'],
		['空色の', 'lightblue'],
		['黄色の', 'yellow'],
		['黄緑の', 'lime'],
		['ピンクの', 'pink'],
		['灰色の', 'gray'],
		['空色の', 'lightgray'],
		['水色の', 'cyan'],
		['紫の', 'purple'],
		['青の', 'blue'],
		['茶色の', 'brown'],
		['緑の', 'green'],
		['赤の', 'red'],
		['黒の', 'black']
	];



	const count = {};


	const make = (start, s) => {




		Object.keys(data)
			.filter((key) => key.startsWith(start))
			.forEach((key) => {

				const [_, name] = key.split('.');


				const __name = data[key];

				let _index = -1;

				colors.forEach(([start, _], index) => {
					if (__name.startsWith(start)) {
						_index = index;
					}
				});


				if (!(name in count)) count[name] = 0;

				let tileData = count[name]++;

				const jpName = '_mc' + s + ' ' + data[key];


				if (_index !== -1) tileData = _index;


				json['.source.js'][data[key]] = {

					prefix: jpName,
					body: `'${name}${tileData ? ':' + tileData : ''}'/*${data[key]}*/`,
					description: ''

				};


			});


		// _mc



	};

	make('tile.', 'b');
	make('item.', 'i');
	make('entity.', 'e');




	const blob = new Blob([JSON.stringify(json)], {
		type: 'application/json'
	});



	feeles.saveAs(blob, 'snippets/Minecraft.json');


}
