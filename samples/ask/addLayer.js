// Primary Canvas (実体)
const primaryCanvas = document.createElement('canvas');
primaryCanvas.width = window.innerWidth;
primaryCanvas.height = window.innerHeight;
primaryCanvas.style.zIndex = 1;
document.body.appendChild(primaryCanvas);

// Array of layer
const layers = [];
// Start main loop
thread();
function thread() {
  const primaryCanvasContext = primaryCanvas.getContext('2d');
  // すべてクリア
  const {width, height} = primaryCanvas;
  primaryCanvasContext.clearRect(0, 0, width, height);
  // primaryCanvas に一枚ずつ layer を描画
  for (const item of layers) {
    const source = item.update();
    primaryCanvas.getContext('2d').drawImage(source, 0, 0);
  }
  // next
  requestAnimationFrame(thread);
}

export default function addLayer(zIndex, update) {
  // あらたなレイヤーを生成
  const layer = {
    zIndex,
    created: Date.now(),
    canvas: primaryCanvas.cloneNode(false),
    update() {
      // 毎フレーム呼ばれるレイヤーごとのルーチン
      if (update) {
        update(layer, (Date.now() - layer.created) / 1000);
      }
      // 描画されたあとの canvas を返す
      return layer.canvas;
    },
    destroy() {
      const index = layers.indexOf(layer);
      if (index > -1) {
        layers.splice(index, 1);
      }
    }
  };
  // t0 の update をコール
  if (update) {
    update(layer, 0);
  }
  // レイヤーをキューに追加
  layers.push(layer);
  layers.sort((a, b) => a.zIndex - b.zIndex);
  // context を返す
  return layer;
}
