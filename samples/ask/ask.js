import addLayer from 'addLayer';

const {SpeechRecognition} = feeles;

function textToSpeech(message) {
  const utter = new SpeechSynthesisUtterance(message);
  utter.lang = ask.lang;
  writeText(message, 'bottom');
  return new Promise((resolve, reject) => {
    utter.onend = (event) => {
      resolve();
    };
    utter.onerror = (event) => {
      console.error(event);
      resolve();
    };
    speechSynthesis.speak(utter);
  });
}

ask.lang = ask.lang || navigator.language || navigator.languages[0];
ask.timeout = ask.timeout || 2000; // 2秒喋らなかったら終了
function speechRecognition() {
  const recognition = new SpeechRecognition();
  recognition.lang = ask.lang;
  recognition.continuous = true;
  recognition.interimResults = true;
  createRecIcon(recognition);
  // 暫定テキスト
  let text = writeText('', 'top');
  // 認識タイムアウト
  let stopTimer;
  const reset = (value) => {
    recognition.onresult = null;
    recognition.onerror = null;
    recognition.stop();
    return value;
  };
  return new Promise((resolve, reject) => {
    recognition.onresult = (event) => {
      const [result] = event.results;
      const message = result[0].transcript;
      if (result.isFinal) {
        // 確定
        resolve(message);
      } else {
        // テキストを更新
        text.destroy();
        text = writeText(message, 'top');
        // ここから2秒喋らなかったら終了
        clearTimeout(stopTimer);
        stopTimer = setTimeout(() => resolve(message), ask.timeout);
      }
    };
    recognition.onerror = (event) => {
      if (event.error === 'no-speech') {
        resolve(''); // 無言だった
      } else if (event.error === 'aborted') {
        resolve(''); //
      } else {
        console.error(event);
        reject(event.error);
      }
    };
    recognition.start();
  }).then(reset, reset);
}

let _touched = false;
function touchThenPrompt() {
  if (!_touched) {
    const testWindow = window.open();
    if (testWindow) {
      testWindow.close();
      _touched = true;
    }
  }
  if (!_touched) {
    const touchMe = document.createElement('div');
    touchMe.style.position = 'fixed';
    touchMe.style.left = '0px';
    touchMe.style.top = '0px';
    touchMe.style.width = '100vw';
    touchMe.style.height = '100vh';
    touchMe.style['z-index'] = '10000';
    touchMe.style['line-height'] = '100vh';
    touchMe.style['text-align'] = 'center';
    touchMe.style['font-size'] = '25vw';
    touchMe.style.color = 'white';
    touchMe.style['background-color'] = 'black';
    touchMe.textContent = 'TOUCH';
    return new Promise((resolve, reject) => {
      touchMe.onclick = () => {
        _touched = true;
        touchMe.parentNode.removeChild(touchMe);
        requestAnimationFrame(() => {
          resolve(prompt(''));
        });
      };
      document.body.appendChild(touchMe);
    });
  }
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(prompt(''));
    }, 100);
  });
}

const request = 'speechSynthesis' in window
  ? textToSpeech
  : (message) => Promise.resolve(alert(message));

const response = SpeechRecognition
  ? speechRecognition
  : touchThenPrompt;

export default function ask(message) {
  if (typeof message === 'string') {
    return request(message);
  } else {
    return response();
  }
}

// Text
function writeText(text, baseline) {
  return addLayer(2, (layer, t) => {
    const canvas = layer.canvas;
    const context = canvas.getContext('2d');

    if (t === 0) {
      const margin = 32;
      const fontSize = 32;
      context.font = `${fontSize}px sans-serif`;
      context.textAlign = 'center';
      context.textBaseline = baseline;
      const metrix = context.measureText(text);
      const baselineHeight = baseline === 'top'
        ? margin - 6
        : canvas.height - margin;
      const bgTop = baseline === 'top'
        ? margin
        : canvas.height - margin - 32;

      context.fillStyle = 'black';
      context.fillRect((canvas.width - metrix.width) / 2, bgTop, metrix.width, 32);

      context.fillStyle = 'white';
      context.fillText(text, canvas.width / 2, baselineHeight, canvas.width);

      context.resetTransform();
    }

    if (t > text.length * 0.4 + 0.1) {
      context.clearRect(0, 0, canvas.width, canvas.height);
      layer.destroy();
    }
  });
}

// REC icon
function createRecIcon(recognition) {
  let showRecIcon = false;
  let sounded = false;

  const layer = addLayer(3, (layer, t) => {
    const canvas = layer.canvas;
    const context = canvas.getContext('2d');
    const radius = 18;

    context.clearRect(0, 0, canvas.width, canvas.height);
    if (showRecIcon) {
      const alpha = sounded ? 1 : Math.sin(t * 2) / 2 + 0.5;
      context.fillStyle = `rgba(255, 0, 0, ${alpha})`;
      context.strokeStyle = `rgba(255, 0, 0, ${alpha})`;
      context.lineWidth = 2;
      context.beginPath();
      context.arc(canvas.width - radius - 10, radius + 10, radius - 6, 0, 2 * Math.PI);
      context.fill();
      context.beginPath();
      context.arc(canvas.width - radius - 10, radius + 10, radius, 0, 2 * Math.PI);
      context.stroke();
    }
  });
  recognition.addEventListener('audiostart', () => {
    showRecIcon = true; // audio の準備ができた
  });
  recognition.addEventListener('speechstart', () => {
    sounded = true; // スピーチを認識し始めた
  });
  recognition.addEventListener('result', (event) => {
    if (event.results[0].isFinal) {
      // 確定した
      layer.destroy();
    }
  });
  recognition.addEventListener('end', (event) => {
    layer.destroy(); // 終了した
  });
}
