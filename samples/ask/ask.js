const {
	SpeechRecognition
} = feeles;

function textToSpeech(message) {
	const utter = new SpeechSynthesisUtterance(message);
	utter.lang = ask.lang;
	writeText(message, '.speak');
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
	setRecIcon(recognition);
	writeText('', '.listen'); // リセット
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
				writeText(message, '.listen');
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

const request = 'speechSynthesis' in window ?
	textToSpeech :
	(message) => Promise.resolve(alert(message));

const response = SpeechRecognition ?
	speechRecognition :
	touchThenPrompt;

export default function ask(message) {
	if (typeof message === 'string') {
		return request(message);
	} else {
		return response();
	}
}

// Text
function writeText(text, querySelector) {
	const element = document.querySelector(querySelector);
	element.textContent = text;

	setTimeout(() => {
		if (element.textContent === text) {
			element.textContent = '';
		}
	}, text.length * 300 + 500);
}

// REC icon
function setRecIcon(recognition) {
	const state = document.querySelector('.root').classList;

	recognition.addEventListener('audiostart', e => {
		state.add('recording');
	});
	recognition.addEventListener('speechstart', e => {
		state.add('speeching');
	});
	recognition.addEventListener('speechend', e => {
		state.remove('speeching');
	});
	recognition.addEventListener('result', e => {
		if (e.results[0].isFinal) {
			// 確定した
			state.remove('recording');
		}
	});
	recognition.addEventListener('end', e => {
		state.remove('recording');
	});
}
