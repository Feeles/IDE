import 'hackforplay/core';

// ゲームをつくる
import gameFunc from './game';
game.onload = () => {
  gameFunc();
  // Hack.player がないとき self.player を代わりに入れる
  if (self.player && !Hack.player) {
    Hack.player = self.player;
  }
};

// マップをつくる
import maps from './maps';
Hack.onload = () => {
  // Hack.maps を事前に作っておく
  Hack.maps = Hack.maps || {};
  maps();
};

// ゲームスタート
Hack.start();
