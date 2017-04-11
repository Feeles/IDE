import addLayer from 'addLayer';

const {SpeechRecognition} = feeles;

function textToSpeech(message) {
  const utter = new SpeechSynthesisUtterance(message);
  utter.lang = ask.lang;
  return new Promise((resolve, reject) => {
    utter.onend = (event) => {
      resolve();
    };
    utter.onerror = (event) => {
      reject(event.error);
    };
    speechSynthesis.speak(utter);
    writeText(message, 'bottom');
  });
}

function speechRecognition() {
  const recognition = new SpeechRecognition();
  recognition.lang = ask.lang;
  recognition.continuous = true;
  recognition.interimResults = true;
  // 暫定テキスト
  let text = writeText('', 'top');
  return new Promise((resolve, reject) => {
    recognition.onresult = (event) => {
      const [result] = event.results;
      if (result.isFinal) {
        // 確定
        resolve(result[0].transcript);
      } else {
        // テキストを更新
        text.destroy();
        text = writeText(result[0].transcript, 'top');
      }
    };
    recognition.onerror = (event) => {
      console.error(event);
      if (event.error === 'no-speech') {
        resolve(''); // 無言だった
      } else {
        reject(event.error);
      }
    };
    recognition.start();
  });
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
      context.textAlign = 'center';
      context.font = "32px sans-serif";
      const metrix = context.measureText(text);

      if (position === 'bottom') {
        context.translate(0, canvas.height - 100);
      }

      context.fillStyle = 'black';
      context.fillRect((canvas.width - metrix.width) / 2, 10, metrix.width, 32);

      context.fillStyle = 'white';
      context.fillText(text, canvas.width / 2, 38, canvas.width);

      context.resetTransform();
    }

    if (t > text.length * 0.4 + 0.1) {
      context.clearRect(0, 0, canvas.width, canvas.height);
      layer.destroy();
    }
  });
}
