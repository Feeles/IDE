import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import LinearProgress from 'material-ui/LinearProgress';
import AvStop from 'material-ui/svg-icons/av/stop';
import transitions from 'material-ui/styles/transitions';
import { red50, red500 } from 'material-ui/styles/colors';

import Editor from './Editor';
import { SourceFile } from '../File/';
import { ShotCard } from '../Cards';
import { CardIcons } from '../Cards/CardWindow';

const getStyle = (props, context, state) => {
  const { palette, spacing, prepareStyles } = context.muiTheme;
  const { shooting, height } = state;

  return {
    root: {
      display: 'flex',
      flexDirection: 'column'
    },
    editor: {
      position: 'relative',
      boxSizing: 'border-box',
      width: '100%',
      height: height + spacing.desktopGutterMore,
      maxHeight: '100%',
      marginLeft: shooting ? '-100%' : 0,
      opacity: shooting ? 0 : 1,
      transition: transitions.easeOut()
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
        rotateY(${shooting ? 180 : 0}deg)`
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
    completes: PropTypes.array
  };

  static contextTypes = {
    muiTheme: PropTypes.object.isRequired
  };

  state = {
    shooting: false,
    height: 0,
    error: null,
    loading: false,
    canRestore: false,
    file: this.props.file || SourceFile.shot('')
  };

  componentWillReceiveProps(nextProps) {
    if (this.props.file !== nextProps.file) {
      const file = nextProps.file || SourceFile.shot('');
      this.setState({ file });

      if (this.codemirror) {
        // setState しただけでは
        // ReactCodeMirror の componentWillReceiveProps に入らず
        // エディタが更新されない. [バグ？]
        this.codemirror.setValue(nextProps.file.text);
      }
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (!prevState.shooting && this.state.shooting) {
      // shooting アニメーションをもとにもどす
      setTimeout(() => {
        this.setState({ shooting: false });
      }, 1000);
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

  shoot = async () => {
    if (this.state.shooting) return;
    await this.handleShot();
    this.setState({ shooting: true });
  };

  handleChange = text => {
    const canRestore = text !== this.state.file.text;
    this.setState({ canRestore });
  };

  handleRestore = () => {
    if (!this.codemirror) {
      return;
    }

    this.codemirror.setValue(this.state.file.text);
    this.setState({ canRestore: false, height: this.getHeight() });
  };

  async handleShot() {
    const text = this.codemirror
      ? this.codemirror.getValue('\n')
      : this.state.file.text;
    const name = this.state.file.name;
    const file = SourceFile.shot(text, name);

    this.props.port.postMessage({ query: 'shot', value: file.serialize() });
  }

  handleCodemirror = ref => {
    if (!ref) return;
    this.codemirror = ref;
    this.codemirror.on('viewportChange', () => {
      this.setState({ height: this.getHeight() });
    });
  };

  render() {
    const { localization, getConfig } = this.props;
    const styles = getStyle(this.props, this.context, this.state);
    const extraKeys = {
      Enter: this.shoot
    };

    return (
      <div>
        {this.state.error
          ? <pre style={styles.error}>{this.state.error.message}</pre>
          : null}
        {this.state.loading ? <LinearProgress /> : null}
        <div style={styles.editor}>
          <Editor
            isSelected
            isCared
            file={this.state.file}
            onChange={this.handleChange}
            getConfig={getConfig}
            codemirrorRef={this.handleCodemirror}
            snippets={this.props.completes}
            extraKeys={extraKeys}
            lineNumbers={false}
            foldGutter={false}
          />
        </div>
        <div style={styles.menu}>
          <RaisedButton
            primary
            label={localization.shotCard.button}
            icon={this.state.shooting ? <AvStop /> : ShotCard.icon()}
            labelPosition="before"
            disabled={this.state.shooting}
            onTouchTap={this.shoot}
            style={styles.shoot}
          />
          <span style={styles.label}>{localization.shotCard.shoot}</span>
          <div style={{ flex: 1 }} />
          <FlatButton
            secondary
            label={localization.shotCard.restore}
            onTouchTap={this.handleRestore}
            disabled={!this.state.canRestore}
          />
        </div>
      </div>
    );
  }
}
