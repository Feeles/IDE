icon.id = 'icon';
async function icon(fileName) {
	const result = await feeles.fetch(fileName);
	const blob = await result.blob();
	const img = document.getElementById(icon.id) || new Image();
	img.id = icon.id;
	img.style.maxWidth = '100%';
	img.onload = e => {
		URL.revokeObjectURL(e.target.src);
	};
	img.onclick = e => {
		// img をクリックするとアイコン選択ダイアログが出る
		input.click();
	};
	img.src = URL.createObjectURL(blob);
	div.appendChild(img);
}
export default icon;

// 暫定コンテナエレメント
const div = document.createElement('div');
div.style.position = 'absolute';
div.style.left = 0;
div.style.top = 0;
div.style.width = '100%';
div.style.height = '100%';
div.style.display = 'flex';
div.style.flexDirection = 'column';
div.style.justifyContent = 'space-around';
div.style.alignItems = 'center';
div.style.zIndex = 2;
document.body.appendChild(div);

// 暫定ファイルインプット
const input = document.createElement('input');
input.style.display = 'none';
input.type = 'file';
input.accept = 'image/*';
input.onchange = async e => {
	const [file] = e.target.files;
	const [ext] = file.name.split('.').slice(-1);
	const fileName = `icons/default.${ext}`;
	await feeles.saveAs(e.target.files[0], fileName);
	await icon(fileName);
	input.style.display = 'none';
};
div.appendChild(input);

(async() => {
	// もし icons/default.png があればアイコンにする
	for (const ext of ['png', 'jpg', 'gif']) {
		const fileName = `icons/default.${ext}`;
		try {
			return await icon(fileName);
		} catch (e) {}
	}
	// もしアイコン画像がなければ、アイコン選択 GUI を表示
	input.style.display = 'block';
})();
