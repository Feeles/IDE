import test from 'ava';
import isNotDeletableLine from './isNotDeletableLine';

const ok = [
  '',
  'await item1.walk();',
  'player.forward = [1, 0];',
  'feeles.openCode("code.js");'
];

const ng = [
  undefined,
  `window.player = new Player(('▼ スキン', Skin.ナイト)); // プレイヤーをつくる`,
  'import "preload";',
  'item.breath({',
  '/*+ アセット */',
  '// ここからスライム',
  '// ここまでスライム',
  'function f() {',
  'const item1 = new RPGObject()',
  'Hack.createMap(`',
  '`);',
  'if (true) {',
  '}',
  '/*',
  '*/'
];

test('isNotDeletableLine', t => {
  for (const item of ok) {
    t.false(isNotDeletableLine(item));
  }
  for (const item of ng) {
    t.true(isNotDeletableLine(item));
  }
});
