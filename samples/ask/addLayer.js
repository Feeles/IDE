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
    const source = item.draw();
    primaryCanvas.getContext('2d').drawImage(source, 0, 0);
  }
  // next
  requestAnimationFrame(thread);
}

export default function addLayer(zIndex, draw) {
  // あらたなレイヤーを生成
  const layer = {
    zIndex,
    canvas: primaryCanvas.cloneNode(false),
    draw() {
      // 毎フレーム呼ばれるレイヤーごとのルーチン
      if (draw) {
        // layer 自身を this, 第一引数に context を与えてコールする
        draw.call(layer, layer.canvas);
      }
      // 描画されたあとの canvas を返す
      return layer.canvas;
    },
  };
  // レイヤーをキューに追加
  layers.push(layer);
  layers.sort((a, b) => a.zIndex - b.zIndex);
  // context を返す
  return layer.canvas.getContext('2d');
}
