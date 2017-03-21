export default function open(url, target, options) {
  if (!target) {
    target = '_blank';
  }
  if (!options) {
    options = [
      `width=550`,
      `height=420`,
      `left=${Math.round((screen.width / 2) - (550 / 2))}`,
      `top=${screen.height > 550 ? Math.round((screen.height / 2) - (420 / 2)) : 0}`,
    ].join();
  }
  return window.open(url, target, options);
}
