export default async function start(ask) {

  // あっちが喋る
  await ask('げんき？');

  // こっちが喋る
  const message = await ask();

  await ask(message + ' か、ならよかった');

}
