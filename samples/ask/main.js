async function start() {

	// 日本語にする
	ask.lang = 'ja-JP';



	/*+ アクション */

}

export default start;



// サンプルコード

// async function start() {

// 	ask.lang = 'ja-JP';

// 	await ask(`今日お昼何食べた？`);

// 	const item1 = await ask();

// 	internet(item1).flickr.face();
// 	await ask(`いいなあ、おいしそう`);
// 	await ask(`${item1}の美味しい食べ方知ってる？`);

// 	const item2 = await ask();

// 	internet(`${item1} 美味しい食べ方`).youtube.card();
// 	await ask(`こうやって食べるんだって`);

// }
