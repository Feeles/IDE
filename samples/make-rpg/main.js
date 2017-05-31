import 'hackforplay/core';

import gameFunc from './game';
import maps from './maps';

let gameOnLoad, hackOnLoad;

if (gameFunc._bundled) {
	// (後方互換性) hackforplay.xyz 移植バージョン
	gameOnLoad = gameFunc.gameOnLoad;
	hackOnLoad = gameFunc.hackOnLoad;
} else {
	// ふつうはこちら
	gameOnLoad = gameFunc;
	hackOnLoad = maps;
}

// ゲームをつくる
game.onload = () => {
	gameOnLoad();
	// Hack.player がないとき self.player を代わりに入れる
	if (self.player && !Hack.player) {
		Hack.player = self.player;
	}
};

// マップをつくる
Hack.onload = () => {
	// Hack.maps を事前に作っておく
	Hack.maps = Hack.maps || {};
	hackOnLoad();
};

// ゲームスタート
Hack.start();
