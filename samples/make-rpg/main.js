import 'hackforplay/core';

// ゲームをつくる
import gameFunc from './game';
game.onload = gameFunc;

// マップをつくる
import maps from './maps';
Hack.onload = maps;

// ゲームスタート
Hack.start();
