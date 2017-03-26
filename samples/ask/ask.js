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

const request = 'speechSynthesis' in window
  ? textToSpeech
  : (message) => Promise.resolve(alert(message));

const response = SpeechRecognition
  ? speechRecognition
  : () => Promise.resolve(prompt());

export default function ask(message) {
  if (typeof message === 'string') {
    return request(message);
  } else {
    return response();
  }
}
