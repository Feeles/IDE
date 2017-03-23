export default function open(url, target, options) {
  if (!target) {
    target = '_blank';
  }
  if (!options) {
    const width = 600;
    const height = 520;
    options = [
      `width=${width}`,
      `height=${height}`,
      `left=${Math.round((screen.width / 2) - (width / 2))}`,
      `top=${screen.height > width ? Math.round((screen.height / 2) - (height / 2)) : 0}`,
    ].join();
  }
  const dialog = window.open(url, target, options);
  if (dialog) {
    window.addEventListener('unload', () => {
      if (dialog) {
        dialog.close();
      }
    });
  }
  return dialog;
}
