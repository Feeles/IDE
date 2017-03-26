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
  });
}

function speechRecognition() {
  const recognition = new SpeechRecognition();
  return new Promise((resolve, reject) => {
    recognition.onresult = (event) => {
      console.info(event);
      resolve(event.results[0][0].transcript);
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
