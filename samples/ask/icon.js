icon.querySelector = '.icon img';
async function icon(fileName) {
	const result = await feeles.fetch(fileName);
	const blob = await result.blob();
	const fileReader = new FileReader();
	fileReader.onload = e => {
		const img = document.querySelector(icon.querySelector);
		img.onload = () => {
			document.querySelector('.root').classList.add('show-icon');
		};
		img.onclick = () => {
			// img をクリックするとアイコン選択ダイアログが出る
			document.querySelector('input.file').click();
		};
		img.src = e.target.result;
	};
	fileReader.readAsDataURL(blob);
}
export default icon;

// 暫定ファイルインプット
document.querySelector('input.file').onchange = async e => {
	const [file] = e.target.files;
	const [ext] = file.name.split('.').slice(-1);
	const fileName = `icons/default.${ext.toLowerCase()}`;
	await feeles.saveAs(file, fileName);
	await icon(fileName);
};

(async() => {
	// もし icons/default.png があればアイコンにする
	for (const ext of ['png', 'jpg', 'jpeg', 'gif']) {
		const fileName = `icons/default.${ext}`;
		try {
			return await icon(fileName);
		} catch (e) {}
	}
	// もしアイコン画像がなければ、アイコン選択 GUI を表示
	document.querySelector('.root').classList.remove('show-icon');
})();
