import 'hackforplay/core';

// ゲームをつくる
import game from './game';
game.onload = game;

// マップをつくる
import maps from './maps';
Hack.onload = maps;

// ゲームスタート
Hack.start();
