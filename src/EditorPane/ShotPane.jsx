import React, {PureComponent, PropTypes} from 'react';
import FlatButton from 'material-ui/FlatButton';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import LinearProgress from 'material-ui/LinearProgress';
import AvStop from 'material-ui/svg-icons/av/stop';
import transitions from 'material-ui/styles/transitions';
import {red50, red500} from 'material-ui/styles/colors';

import Editor from './Editor';
import {SourceFile} from '../File/';
import {ShotCard} from '../Cards';
import {CardIcons} from '../Cards/CardWindow';

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

export default class ShotPane extends PureComponent {

  static propTypes = {
    files: PropTypes.array.isRequired,
    findFile: PropTypes.func.isRequired,
    localization: PropTypes.object.isRequired,
    getConfig: PropTypes.func.isRequired,
    port: PropTypes.object,
    file: PropTypes.object,
    completes: PropTypes.array,
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
  };

  componentWillReceiveProps(nextProps, nextState) {
    if (this.props.file !== nextProps.file && nextProps.file) {
      if (this.codemirror) {
        // setState しただけでは
        // ReactCodeMirror の componentWillReceiveProps に入らず
        // エディタが更新されない. [バグ？]
        this.codemirror.setValue(nextProps.file.text);
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
      canRestore: text !== this.props.file.text,
      height: this.getHeight()
    });
  };

  handleRestore = () => {
    if (!this.props.file || !this.codemirror) {
      return;
    }

    this.codemirror.setValue(this.props.file.text);
    this.setState({canRestore: false, height: this.getHeight()});
  };

  async handleShot() {
    const text = this.codemirror
      ? this.codemirror.getValue('\n')
      : this.props.file.text;

    await new Promise((resolve, reject) => {
      this.setState({
        error: null,
        loading: true
      }, resolve);
    });

    if (this.props.port) {
      const babelrc = this.props.getConfig('babelrc');
      try {
        const { name } = this.props.file;
        const file = await SourceFile.shot(text, name).babel(babelrc);
        this.props.port.postMessage({query: 'shot', value: file.serialize()});

        if (process.env.NODE_ENV === 'production') {
          if (ga) {
            ga('send', 'event', 'Code', 'run', text);
          }
        }
      } catch (e) {
        console.error(e);
        this.setState({error: e});

        if (process.env.NODE_ENV === 'production') {
          if (ga) {
            ga('send', 'event', 'Code', 'error', text);
          }
        }
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
    if (!this.props.file) {
      return null;
    }
    const {localization, getConfig} = this.props;
    const {anim} = this.state;

    const styles = getStyle(this.props, this.context, this.state);

    const extraKeys = {
      'Enter': this.shoot
    };

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
          <Editor isSelected isCared file={this.props.file} onChange={this.handleChange} getConfig={getConfig} codemirrorRef={this.handleCodemirror} snippets={this.props.completes} extraKeys={extraKeys} lineNumbers={false} />
        </div>
        <div style={styles.menu}>
          <FloatingActionButton mini disabled={anim !== 0} onTouchTap={this.shoot} style={styles.shoot}>
            {anim === 0
              ? ShotCard.icon()
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
