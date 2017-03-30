import internet from 'internet';


export default async function start(ask) {

  await ask(`今日お昼何食べた？`);

  const item1 = await ask();

  internet(item1).flickr.face();

  await ask(`わかるー。${item1}、おいしいよね`);

  await ask(`${item1}の美味しい食べ方知ってる？`);

  const item2 = await ask();

  await ask(`こうやって食べるんだって`);

  await internet(`${item1} 美味しい食べ方`).youtube.card();

}
