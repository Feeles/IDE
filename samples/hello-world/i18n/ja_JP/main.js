import './preload';

if (window) {
	if (!window) {
		// インデントに色がつきます
	}
}

// feeles.openCode('code.js');

const いろ = ('▼ サンプル', '');
document.body.style.backgroundColor = いろ;

/*+ ゲームがはじまったとき */

// Syntax: // [で囲むと[リンク]になります. [同じ行にいくつでも作れます]
// Syntax: // `[これ]`はリンクにはなりません. `[これ]はなります


const title = 'タイトル';

/* global feeles */
feeles.connected.then(({ port }) => {
  port.postMessage({
    query: 'menuTitle',
    value: title
  });
});
