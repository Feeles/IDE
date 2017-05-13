import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import Popout from 'jsx/ReactPopout';
import IconButton from 'material-ui/IconButton';
import NavigationRefreh from 'material-ui/svg-icons/navigation/refresh';
import transitions from 'material-ui/styles/transitions';

import { BinaryFile, SourceFile, makeFromFile } from 'File/';
import composeEnv from 'File/composeEnv';
import popoutTemplate from 'html/popout';
import Screen from './Screen';
import setSrcDoc from './setSrcDoc';
import registerHTML from './registerHTML';
import ResolveProgress from './ResolveProgress';

const ConnectionTimeout = 1000;
const popoutURL = URL.createObjectURL(
  new Blob([popoutTemplate()], { type: 'text/html' })
);

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

const getStyle = (props, context, state) => {
  const { palette, appBar } = context.muiTheme;
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
    setPort: PropTypes.func.isRequired,
    localization: PropTypes.object.isRequired,
    getConfig: PropTypes.func.isRequired,
    addFile: PropTypes.func.isRequired,
    findFile: PropTypes.func.isRequired,
    putFile: PropTypes.func.isRequired,
    coreString: PropTypes.string,
    saveAs: PropTypes.func.isRequired,
    setLocation: PropTypes.func.isRequired,
    frameWidth: PropTypes.number.isRequired,
    frameHeight: PropTypes.number.isRequired
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
    if (/^\#\//.test(location.hash)) {
      this.handleHashChanged();
    } else {
      // default href で起動
      this.props.setLocation();
    }
  }

  componentDidUpdate(prevProps, prevStates) {
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

  componentWillUnmount() {
    window.removeEventListener('hashchange', this.handleHashChanged);
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
    const { setPort, getConfig } = this.props;

    const babelrc = getConfig('babelrc');
    const env = composeEnv(getConfig('env'));

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

    const channel = new MessageChannel();
    channel.port1.addEventListener('message', event => {
      const reply = params => {
        params = Object.assign(
          {
            id: event.data.id
          },
          params
        );
        channel.port1.postMessage(params);
      };
      this.handleMessage(event, reply);
    });
    this.handlePort(channel.port1);

    this.iframe.contentWindow.postMessage(
      {
        env
      },
      '*',
      [channel.port2]
    );
  }

  handlePort(port) {
    this.props.setPort(port);
    port.start();
    this.setState({ port });
  }

  handleMessage = async ({ data }, reply) => {
    switch (data.query) {
      case 'fetch':
        const file = this.props.findFile(data.value);
        if (file) {
          reply({ value: file.blob });
        } else {
          reply({ error: true });
        }
        break;
      case 'resolve':
        const file2 =
          this.props.findFile(`${data.value}.js`) ||
          this.props.findFile(data.value);
        if (file2) {
          const babelrc = this.props.getConfig('babelrc');
          const result = await file2.babel(babelrc);
          reply({ value: result.text });
        } else {
          reply({ error: true });
        }
        break;
      case 'saveAs':
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
        break;
      case 'reload':
        this.props.setLocation();
        break;
      case 'replace':
        location.hash = data.value.replace(/^\/*/, '/');
        break;
      case 'error':
        if (!this.state.error) {
          this.setState({
            error: new Error(data.value)
          });
        }
        break;
      case 'api.SpeechRecognition':
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
          recognition[`on${type}`] = event => {
            reply({ type });
          };
        });
        recognition.start();
        break;
    }
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
    if (/^\#\//.test(location.hash)) {
      const href = location.hash.substr(2);
      this.props.setLocation(href);
      if (process.env.NODE_ENV === 'production') {
        if (ga) {
          ga('set', 'page', `/${href}`);
          ga('send', 'pageview');
        }
      }
    }
  };

  render() {
    const { error } = this.state;
    const { isPopout, reboot } = this.props;

    const popout = isPopout && !reboot
      ? <Popout
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
      : null;

    const styles = getStyle(this.props, this.context, this.state);

    return (
      <div style={styles.root} onTouchTap={this.handleTouch}>
        {popout}
        <Screen
          animation
          display={!isPopout}
          frameRef={this.handleFrame}
          reboot={reboot}
          error={error}
          width={this.props.frameWidth}
          height={this.props.frameHeight}
        />
        <ResolveProgress port={this.state.port} />
      </div>
    );
  }
}
