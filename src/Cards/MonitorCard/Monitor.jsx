import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import Popout from '../../jsx/ReactPopout';

import { SourceFile, makeFromFile } from '../../File/';
import composeEnv from '../../File/composeEnv';
import Screen from './Screen';
import setSrcDoc from './setSrcDoc';
import registerHTML from './registerHTML';
import ResolveProgress from './ResolveProgress';
import uniqueId from '../../utils/uniqueId';
import { getPrimaryUser } from '../../database/';

import fetchPonyfill from 'fetch-ponyfill';
const fetch =
  window.fetch ||
  // for IE11
  fetchPonyfill({
    // TODO: use babel-runtime to rewrite this into require("babel-runtime/core-js/promise")
    Promise
  }).fetch;

const ConnectionTimeout = 1000;
const popoutTemplate = `<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8">
        <style media="screen">
        body {
            margin: 0;
        }
        #popout-content-container {
            width: 100vw;
            height: 100vh;
            display: flex;
        }
        </style>
    </head>
    <body>
    </body>
</html>
`;
const popoutURL = URL.createObjectURL(
  new Blob([popoutTemplate], { type: 'text/html' })
);

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;
const webkitSpeechGrammarList = window.webkitSpeechGrammarList;

const getStyle = (props, context) => {
  const { transitions } = context.muiTheme;
  const fullScreen = (yes, no) => (props.isFullScreen ? yes : no);

  return {
    root: {
      position: fullScreen('fixed', 'relative'),
      width: '100%',
      height: '100%',
      left: 0,
      top: 0,
      boxSizing: 'border-box',
      opacity: 1,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
      zIndex: 300,
      transition: transitions.easeOut()
    },
    swap: {
      position: 'absolute',
      right: 0,
      zIndex: 2
    }
  };
};

export default class Monitor extends PureComponent {
  static propTypes = {
    files: PropTypes.array.isRequired,
    cards: PropTypes.object.isRequired,
    isPopout: PropTypes.bool.isRequired,
    isFullScreen: PropTypes.bool.isRequired,
    reboot: PropTypes.bool.isRequired,
    href: PropTypes.string.isRequired,
    togglePopout: PropTypes.func.isRequired,
    toggleFullScreen: PropTypes.func.isRequired,
    localization: PropTypes.object.isRequired,
    getConfig: PropTypes.func.isRequired,
    addFile: PropTypes.func.isRequired,
    findFile: PropTypes.func.isRequired,
    putFile: PropTypes.func.isRequired,
    setLocation: PropTypes.func.isRequired,
    frameWidth: PropTypes.number.isRequired,
    frameHeight: PropTypes.number.isRequired,
    globalEvent: PropTypes.object.isRequired
  };

  static contextTypes = {
    muiTheme: PropTypes.object.isRequired
  };

  state = {
    error: null,
    port: null
  };

  popoutOptions = {
    width: 300,
    height: 150, // means innerHeight of browser expecting Safari.
    left: 50,
    top: 50
  };

  popoutClosed = false;

  componentWillMount() {
    // feeles.github.io/sample/#/path/to/index.html
    window.addEventListener('hashchange', this.handleHashChanged);
    if (/^#\//.test(location.hash)) {
      this.handleHashChanged();
    } else {
      // default href で起動
      this.props.setLocation();
    }

    const { globalEvent } = this.props;
    const on = globalEvent.on.bind(globalEvent);
    on('postMessage', this.handlePostMessage);
    on('message.fetch', this.handleFetch);
    on('message.resolve', this.handleResolve);
    on('message.fetchDataURL', this.handleFetchDataURL);
    on('message.saveAs', this.handleSaveAs);
    on('message.reload', this.handleReload);
    on('message.replace', this.handleReplace);
    on('message.error', this.handleError);
    on('message.ipcRenderer.*', this.handleIpcRenderer);
    on('message.api.SpeechRecognition', this.handleSpeechRecognition);
    on('message.setTimeout', this.handleSetTimeout);
    on('message.clearTimeout', this.handleClearTimeout);
    on('message.setInterval', this.handleSetInterval);
    on('message.clearInterval', this.handleClearInterval);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.reboot && !this.props.reboot) {
      if (this.props.isPopout || this.popoutClosed) {
        // react-popoutがpopoutWindowにDOMをrenderした後でstartする必要がある
        // renderを補足するのは難しい&updateの度に何度もrenderされる=>delayを入れる
        setTimeout(() => this.start(), 500);
        this.popoutClosed = false;
      } else {
        this.start();
      }
    }
    if (prevProps.isPopout && !this.props.isPopout) {
      this.popoutClosed = true; // Use delay
    }
  }

  componentDidMount() {
    if (window.ipcRenderer) {
      this._emit = window.ipcRenderer.emit; // あとで戻せるようオリジナルを保持
      const self = this;
      window.ipcRenderer.emit = (...args) => {
        // ipcRenderer.emit をオーバーライドし, 全ての postMessage で送る
        if (self.state && self.state.port) {
          self.state.port.postMessage({
            query: 'ipcRenderer.emit',
            value: JSON.parse(JSON.stringify(args))
          });
        }
        this._emit.apply(this, args);
      };
    }
  }

  componentWillUnmount() {
    window.removeEventListener('hashchange', this.handleHashChanged);
    if (window.ipcRenderer) {
      // オリジナルの参照を戻す. Monitor が複数 mount されることはない(はず)
      window.ipcRenderer.emit = this._emit;
    }
  }

  get iframe() {
    return this.props.isPopout ? this.popoutFrame : this.inlineFrame;
  }

  prevent = Promise.resolve();
  async start() {
    const _prevent = this.prevent;

    this.prevent = _prevent.then(() => this.startProcess()).catch(error => {
      if (error) {
        this.setState({ error });
      } else if (this.props.isPopout) {
        this.start();
      }
    });

    await _prevent;

    this.setState({ error: null, port: null });
  }

  async startProcess() {
    const { getConfig, findFile } = this.props;

    // env
    const env = composeEnv(getConfig('env'));
    const versionUUIDFile = findFile('feeles/.uuid');
    if (versionUUIDFile) {
      env.VERSION_UUID = versionUUIDFile.text;
    } else {
      // Backward compatibility
      const element = document.querySelector('meta[name="version_uuid"]');
      if (element) {
        env.VERSION_UUID = element.getAttribute('content');
      }
    }
    env.USER_UUID = (await getPrimaryUser()).uuid;

    const htmlFile = this.props.findFile(this.props.href) || SourceFile.html();

    const html = await registerHTML(htmlFile.text, this.props.findFile, env);

    const tryLoading = () =>
      new Promise((resolve, reject) => {
        // iframe.srcdoc, onload => resolve
        setSrcDoc(this.iframe, html, resolve);
        // Connection timeouted, then retry
        setTimeout(reject, ConnectionTimeout);
      }).catch(() => tryLoading());

    await tryLoading();

    const { port1, port2 } = new MessageChannel();
    port1.addEventListener('message', event => {
      const reply = params => {
        params = { id: event.data.id, ...(params || {}) };
        port1.postMessage(params);
      };

      const { type, data } = event;
      const name = data.query ? `message.${data.query}` : 'message';
      this.props.globalEvent.emit(name, { type, data, reply });
    });
    port1.start();
    this.setState({ port: port1 });

    this.iframe.contentWindow.postMessage(
      {
        env
      },
      '*',
      [port2]
    );
  }

  handlePostMessage = value => {
    // emitAsync('postMessage', value)
    const { port } = this.state;
    if (!port) return;
    // reply を receive するための id
    value = { id: uniqueId(), ...value };
    return new Promise(resolve => {
      // catch reply message (once)
      const task = event => {
        if (!event.data || event.data.id !== value.id) return;
        if (port) port.removeEventListener('message', task);
        resolve(event.data);
      };
      port.addEventListener('message', task);
      // post message to frame
      port.postMessage(value);
    });
  };

  handleFetch = async ({ data, reply }) => {
    const file = this.props.findFile(data.value);
    if (file) {
      reply({ value: file.blob });
    } else if (data.value.indexOf('http') === 0) {
      try {
        const response = await fetch(data.value);
        const blob = await response.blob();
        reply({ value: blob });
      } catch (e) {
        reply({ error: e });
      }
    } else {
      reply({ error: true });
    }
  };

  handleResolve = async ({ data, reply }) => {
    const file =
      this.props.findFile(`${data.value}.js`) ||
      this.props.findFile(data.value);
    if (file) {
      const babelrc = this.props.getConfig('babelrc');
      const result = await file.babel(babelrc, e => {
        reply({ error: e });
      });
      if (result) {
        reply({ value: result.text });
      }
    } else if (data.value.indexOf('http') === 0) {
      try {
        const response = await fetch(data.value);
        const text = await response.text();
        reply({ value: text });
      } catch (e) {
        reply({ error: e });
      }
    } else {
      reply({ error: true });
    }
  };

  handleFetchDataURL = async ({ data, reply }) => {
    const file = this.props.findFile(data.value);
    if (file) {
      reply({
        value: await file.toDataURL()
      });
    } else if (data.value.indexOf('http') === 0) {
      try {
        const response = await fetch(data.value);
        const blob = await response.blob();
        const fileReader = new FileReader();
        fileReader.onload = () => {
          reply({ value: fileReader.result });
        };
        fileReader.readAsDataURL(blob);
      } catch (e) {
        reply({ error: e });
      }
    } else {
      reply({ error: true });
    }
  };

  handleSaveAs = async ({ data, reply }) => {
    const [blob, name] = data.value;
    const file3 = await makeFromFile(blob);
    const exist = this.props.findFile(name);
    if (exist) {
      const { key } = exist;
      await this.props.putFile(exist, file3.set({ key, name }));
    } else {
      await this.props.addFile(file3.set({ name }));
    }
    reply();
  };

  handleReload = () => {
    this.props.setLocation();
  };

  handleReplace = ({ data }) => {
    location.hash = data.value.replace(/^\/*/, '/');
  };

  handleError = ({ data }) => {
    if (!this.state.error) {
      this.setState({
        error: new Error(data.value)
      });
    }
  };

  handleIpcRenderer = ({ data }) => {
    if (window.ipcRenderer) {
      window.ipcRenderer.sendToHost(...Object.values(data.value));
    } else {
      console.warn('window.ipcRenderer is not defined');
    }
  };

  setTimeoutId = new Map();
  handleSetTimeout = ({ data, reply }) => {
    const { timeoutId, delay } = data.value;
    this.setTimeoutId.set(timeoutId, setTimeout(reply, delay));
  };
  handleClearTimeout = ({ data }) => {
    clearInterval(this.setTimeoutId.get(data.value.timeoutId));
  };

  setIntervalId = new Map();
  handleSetInterval = ({ data, reply }) => {
    const { intervalId, delay } = data.value;
    this.setIntervalId.set(intervalId, setInterval(reply, delay));
  };
  handleClearInterval = ({ data }) => {
    clearInterval(this.setIntervalId.get(data.value.intervalId));
  };

  handleSpeechRecognition = ({ data, reply }) => {
    const recognition = new SpeechRecognition();
    for (const prop of [
      'lang',
      'continuous',
      'interimResults',
      'maxAlternatives',
      'serviceURI'
    ]) {
      if (data.value[prop] !== undefined) {
        recognition[prop] = data.value[prop];
      }
    }
    if (Array.isArray(data.value.grammars)) {
      recognition.grammars = new webkitSpeechGrammarList();
      for (const { src, weight } of data.value.grammars) {
        recognition.grammars.addFromString(src, weight);
      }
    }
    recognition.onresult = event => {
      const results = [];
      for (const items of event.results) {
        const result = [];
        result.isFinal = items.isFinal;
        for (const { confidence, transcript } of items) {
          result.push({ confidence, transcript });
        }
        results.push(result);
      }
      reply({
        type: 'result',
        event: {
          results
        }
      });
    };
    recognition.onerror = event => {
      reply({
        type: 'error',
        event: {
          error: event.error
        }
      });
    };
    [
      'audioend',
      'audiostart',
      'end',
      'nomatch',
      'soundend',
      'soundstart',
      'speechend',
      'speechstart',
      'start'
    ].forEach(type => {
      recognition[`on${type}`] = () => {
        reply({ type });
      };
    });
    recognition.start();
  };

  handlePopoutOpen = (...args) => {
    this.parent = window.open.apply(window, args);
    if (this.parent) {
      this.parent.addEventListener('load', () => {
        const out = this.popoutOptions.height !== this.parent.innerHeight;
        this.parent.addEventListener('resize', () => {
          this.popoutOptions = Object.assign({}, this.popoutOptions, {
            width: this.parent.innerWidth,
            height: out ? this.parent.outerHeight : this.parent.innerHeight
          });
        });

        const popoutMove = setInterval(() => {
          if (
            this.parent.screenX === this.popoutOptions.left &&
            this.parent.screenY === this.popoutOptions.top
          ) {
            return;
          }
          this.popoutOptions = Object.assign({}, this.popoutOptions, {
            left: this.parent.screenX,
            top: this.parent.screenY
          });
        }, 100);

        this.parent.addEventListener('beforeunload', () => {
          clearInterval(popoutMove);
        });
      });
    }
    return this.parent;
  };

  handlePopoutClose = () => {
    if (this.props.isPopout && !this.props.reboot) {
      this.props.togglePopout();
    }
  };

  handleFrame = ref => {
    if (!this.props.isPopout) {
      this.inlineFrame = ref;
    } else {
      this.popoutFrame = ref;
    }
  };

  handleTouch = () => {
    if (this.props.isFullScreen) {
      this.props.toggleFullScreen();
    }
  };

  handleHashChanged = () => {
    if (/^#\//.test(location.hash)) {
      const href = location.hash.substr(2);
      this.props.setLocation(href);
    }
  };

  render() {
    const { error } = this.state;
    const { isPopout, reboot } = this.props;

    const popout =
      isPopout && !reboot ? (
        <Popout
          url={popoutURL}
          title="app"
          options={this.popoutOptions}
          window={{
            open: this.handlePopoutOpen,
            addEventListener: window.addEventListener.bind(window),
            removeEventListener: window.removeEventListener.bind(window)
          }}
          onClosing={this.handlePopoutClose}
        >
          <Screen
            display
            frameRef={this.handleFrame}
            handleReload={() => this.props.setLocation()}
            reboot={reboot}
            error={error}
            width={this.props.frameWidth}
            height={this.props.frameHeight}
          />
        </Popout>
      ) : null;

    const styles = getStyle(this.props, this.context, this.state);

    return (
      <div style={styles.root} onClick={this.handleTouch}>
        {popout}
        <Screen
          animation
          display={!isPopout}
          frameRef={this.handleFrame}
          reboot={reboot}
          error={error}
          width={this.props.frameWidth}
          height={this.props.frameHeight}
          isFullScreen={this.props.isFullScreen}
        />
        <ResolveProgress globalEvent={this.props.globalEvent} />
      </div>
    );
  }
}
