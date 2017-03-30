const {SpeechRecognition} = feeles;

function textToSpeech(message) {
  const utter = new SpeechSynthesisUtterance(message);
  return new Promise((resolve, reject) => {
    utter.onend = (event) => {
      resolve();
    };
    utter.onerror = (event) => {
      reject(event.error);
    };
    speechSynthesis.speak(utter);
    writeText(message);
  });
}

function speechRecognition() {
  const recognition = new SpeechRecognition();
  return new Promise((resolve, reject) => {
    recognition.onresult = (event) => {
      console.info(event);
      const text = event.results[0][0].transcript;
      writeText(text);
      resolve(text);
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
  return Promise.resolve(prompt(''));
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
const canvas = document.createElement('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
canvas.style['z-index'] = 1;
document.body.appendChild(canvas);
const context = canvas.getContext('2d');
let refreshTimer;
function writeText(text) {
  if (!context) return;
  context.textAlign = 'center';
  context.font = "32px sans-serif";
  const metrix = context.measureText(text);
  context.clearRect(0, 0, canvas.width, canvas.height);

  context.fillStyle = 'black';
  context.fillRect((canvas.width - metrix.width) / 2, canvas.height - 70, metrix.width, 32);

  context.fillStyle = 'white';
  context.fillText(text, canvas.width / 2, canvas.height - 40, canvas.width);

  clearTimeout(refreshTimer);
  refreshTimer = setTimeout(() => {
    context.clearRect(0, 0, canvas.width, canvas.height);
  }, text.length * 250 + 0.1);
}