import React, {PureComponent, PropTypes} from 'react';
import FlatButton from 'material-ui/FlatButton';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import LinearProgress from 'material-ui/LinearProgress';
import AvPlayArrow from 'material-ui/svg-icons/av/play-arrow';
import AvStop from 'material-ui/svg-icons/av/stop';
import transitions from 'material-ui/styles/transitions';
import {red50, red500} from 'material-ui/styles/colors';

import Editor from './Editor';
import {SourceFile} from '../File/';
import shallowEqual from '../utils/shallowEqual';

const durations = [600, 1400, 0];

const getStyle = (props, context, state) => {
  const {palette, spacing, prepareStyles} = context.muiTheme;
  const {anim, height} = state;

  return {
    root: {
      display: 'flex',
      flexDirection: 'column'
    },
    editor: {
      boxSizing: 'border-box',
      width: '100%',
      height: Math.min(500, height + spacing.desktopGutterMore),
      marginLeft: anim === 1
        ? 400
        : 0,
      transform: `
        rotateZ(${anim === 1
        ? 180
        : 0}deg)
        scaleY(${anim === 2
          ? 0
          : 1})`,
      opacity: anim === 0
        ? 1
        : 0.1,
      transition: transitions.easeOut(durations[anim] + 'ms')
    },
    menu: {
      position: 'relative',
      display: 'flex',
      flexDirection: 'row-reverse',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
      height: 36
    },
    shoot: {
      marginRight: 9,
      marginBottom: 4,
      transform: `
        rotateY(${anim === 0
        ? 0
        : 180}deg)`
    },
    label: {
      color: palette.secondaryTextColor,
      fontSize: '.8rem'
    },
    error: {
      flex: '0 1 auto',
      margin: 0,
      padding: 8,
      backgroundColor: red50,
      color: red500,
      fontFamily: 'Consolas, "Liberation Mono", Menlo, Courier, monospace',
      overflow: 'scroll'
    }
  };
};

export default class ShotCard extends PureComponent {

  static propTypes = {
    files: PropTypes.array.isRequired,
    findFile: PropTypes.func.isRequired,
    localization: PropTypes.object.isRequired,
    getConfig: PropTypes.func.isRequired,
    port: PropTypes.object,
  };

  static contextTypes = {
    muiTheme: PropTypes.object.isRequired
  };

  state = {
    anim: 0,
    height: 0,
    error: null,
    loading: false,
    canRestore: false,
    file: null,
    completes: []
  };

  componentWillMount() {
    this.refreshFile();
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.files !== nextProps.files) {
      this.refreshFile();
    }

    if (this.props.port !== nextProps.port) {
      if (this.props.port) {
        this.props.port.removeEventListener('message', this.handleMessage);
      }
      if (nextProps.port) {
        nextProps.port.addEventListener('message', this.handleMessage);
      }
    }
  }

  handleMessage = (event) => {
    if (!event.data || !event.data.query)
      return;
    const {query, value} = event.data;

    // Completes
    if (query === 'complete') {
      if (!shallowEqual(value, this.state.completes)) {
        this.setState({completes: value});
      }
    }
  };

  refreshFile() {
    const shotFile = this.props.findFile('feeles/shot.js') || SourceFile.shot('');

    this.setState({file: shotFile});

    if (this.state.file !== shotFile) {
      if (this.codemirror && shotFile) {
        // ここで file を setState しただけでは
        // ReactCodeMirror の componentWillReceiveProps に入らず
        // エディタが更新されない. [バグ？]
        this.codemirror.setValue(shotFile.text);
      }
    }
  }

  getHeight = () => {
    if (!this.codemirror) {
      return 0;
    }
    const lastLine = this.codemirror.lastLine() + 1;
    const height = this.codemirror.heightAtLine(lastLine, 'local');
    return height;
  };

  shoot = async() => {
    if (this.state.anim !== 0) {
      return;
    }

    const transition = (anim, delay) => {
      return new Promise((resolve, reject) => {
        this.setState({
          anim
        }, () => {
          setTimeout(() => resolve(), durations[anim] + 10);
        });
      });
    };

    await this.handleShot();
    await transition(1);
    await transition(2);
    await transition(0);
  };

  handleChange = (text) => {
    this.setState({
      canRestore: text !== this.state.file.text,
      height: this.getHeight()
    });
  };

  handleRestore = () => {
    if (!this.state.file || !this.codemirror) {
      return;
    }

    this.codemirror.setValue(this.state.file.text);
    this.setState({canRestore: false, height: this.getHeight()});
  };

  async handleShot() {
    const text = this.codemirror
      ? this.codemirror.getValue('\n')
      : this.state.file.text;

    await new Promise((resolve, reject) => {
      this.setState({
        error: null,
        loading: true
      }, resolve);
    });

    if (this.props.port) {
      const babelrc = this.props.getConfig('babelrc');
      try {
        const file = await SourceFile.shot(text).babel(babelrc);
        this.props.port.postMessage({query: 'shot', value: file.serialize()});

      } catch (e) {
        console.error(e);
        this.setState({error: e});
      }
    }

    this.setState({loading: false});
  };

  handleCodemirror = (ref) => {
    if (!ref) {
      return;
    }
    this.codemirror = ref;
    this.setState({height: this.getHeight()});
  };

  render() {
    const {localization, getConfig} = this.props;
    const {anim} = this.state;

    const styles = getStyle(this.props, this.context, this.state);

    return (
      <div>
        {this.state.error
          ? (
            <pre style={styles.error}>{this.state.error.message}</pre>
          )
          : null}
        {this.state.loading
          ? (<LinearProgress/>)
          : null}
        <div style={styles.editor}>
          <Editor isSelected isCared file={this.state.file} onChange={this.handleChange} getConfig={getConfig} codemirrorRef={this.handleCodemirror} snippets={this.state.completes}/>
        </div>
        <div style={styles.menu}>
          <FloatingActionButton mini disabled={anim !== 0} onTouchTap={this.shoot} style={styles.shoot}>
            {anim === 0
              ? (<AvPlayArrow/>)
              : (<AvStop/>)}
          </FloatingActionButton>
          <span style={styles.label}>{localization.shotCard.shoot}</span>
          <div style={{
            flex: '1 1 auto'
          }}></div>
          <FlatButton secondary label={localization.shotCard.restore} onTouchTap={this.handleRestore} disabled={!this.state.canRestore}/>
        </div>
      </div>
    );
  }
}
