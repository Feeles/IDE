import 'hackforplay/rpg-kit-main';
import 'hackforplay/rpg-kit-rpgobjects';

const synonyms = [
  ['knight', '_kきし'],
  ['darkKnight', '_aあんこくきし'],
  ['slime', '_sスライム'],
  ['insect', '_iいもむし'],
  ['spider', '_kくも'],
  ['bat', '_kこうもり'],
  ['dragon', '_dドラゴン'],
  ['minotaur', '_mミノタウルス'],
  ['boy', '_o男の子'],
  ['girl', '_o女の子'],
  ['woman', '_o女の人'],
  ['enchantBookItem', '_m魔道書'],
  ['explosion', '_bばくえん'],
  ['ouroboros', '_uウロボロス'],
  ['beam', '_bビーム'],
  ['downStair', '_kくだりかいだん'],
  ['upStair', '_nのぼりかいだん'],
  ['warp', '_wワープ'],
  ['castle', '_sしろ'],
  ['flower', '_hはな'],
  ['ruby', '_rルビー'],
  ['trap', '_wわな'],
  ['usedTrap', '_wわなかかった'],
  ['heart', '_hハート'],
  ['tree', '_k木'],
  ['rock', '_いわ'],
  ['crayWall', '_tつちかべ'],
  ['stoneWall', '_iいしかべ'],
  ['box', '_tたからばこ'],
  ['openedBox', '_tたからばこひらいた'],
  ['skull', '_dドクロ'],
  ['poo', '_uうんこ'],
  ['pot', '_tつぼ'],
  ['diamond', '_dダイヤモンド'],
  ['magic', '_mまほうじん'],
  ['usedMagic', '_mまほうじんひかった'],
  ['coin', '_kコイン'],
  ['sapphire', '_sサファイア'],
  ['star', '_hほし'],
  ['key', '_kかぎ'],
  ['bomb', '_bばくだん']
];

for (const [from, to] of synonyms) {
  self[to] = Hack.assets[from];
}
