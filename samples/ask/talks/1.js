export default async function start(ask) {
  // あっちがしゃべる
  await ask('げんき？');

  // こっちがしゃべる
  const message = await ask();

  // こたえる
  await ask(`わたしも、${message}`);

}
