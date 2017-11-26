import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import RaisedButton from 'material-ui/RaisedButton';
import LinearProgress from 'material-ui/LinearProgress';
import AvStop from 'material-ui/svg-icons/av/stop';
import { red50, red500 } from 'material-ui/styles/colors';

import { SourceFile } from 'File/';
import ShotCard from './';
import Editor from './Editor';
import excessiveCare from './excessiveCare';

const getStyle = (props, context, state) => {
  const { palette, spacing, transitions, prepareStyles } = context.muiTheme;
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
      transform: `translate(${shooting ? '-500px' : 0})`,
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
    },
    restore: {
      margin: 4
    }
  };
};

export default class ShotPane extends PureComponent {
  static propTypes = {
    files: PropTypes.array.isRequired,
    findFile: PropTypes.func.isRequired,
    localization: PropTypes.object.isRequired,
    getConfig: PropTypes.func.isRequired,
    loadConfig: PropTypes.func.isRequired,
    file: PropTypes.object,
    completes: PropTypes.array,
    globalEvent: PropTypes.object.isRequired
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

  componentDidMount() {
    this.codeMirror.on('beforeChange', excessiveCare);
    this.codeMirror.on('change', this.handleChange);
    this.codeMirror.on('swapDoc', this.handleChange);
    this.codeMirror.on('viewportChange', this.handleViewportChange);
    this.codeMirror.on('swapDoc', this.handleViewportChange);
    this.handleViewportChange(this.codeMirror);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.file !== nextProps.file) {
      const file = nextProps.file || SourceFile.shot('');
      this.setState({ file });
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (!prevState.shooting && this.state.shooting) {
      // shooting アニメーションをもとにもどす
      setTimeout(() => {
        this.setState({ shooting: false });
      }, 1000);
    }
    if (prevState.height !== this.state.height) {
      setTimeout(() => {
        // 表示可能領域が変わったので、トランジション後に再描画する
        if (this.codeMirror) {
          this.codeMirror.refresh();
        }
      }, 300);
    }
  }

  shoot = async () => {
    if (this.state.shooting) return;
    await this.handleShot();
    this.setState({ shooting: true });
  };

  handleChange = cm => {
    const canRestore = cm.getValue() !== this.state.file.text;
    this.setState({ canRestore });
  };

  handleRestore = () => {
    this.codeMirror.setValue(this.state.file.text);
  };

  async handleShot() {
    const text = this.codeMirror
      ? this.codeMirror.getValue('\n')
      : this.state.file.text;
    const name = this.state.file.name;
    const file = SourceFile.shot(text, name);
    // frame に shot をおくる
    const request = {
      query: 'shot',
      value: file.serialize()
    };
    this.props.globalEvent.emit('postMessage', request);
  }

  handleViewportChange = cm => {
    const lastLine = cm.lastLine() + 1;
    const height = cm.heightAtLine(lastLine, 'local');
    this.setState({ height });
  };

  render() {
    const { localization, getConfig, loadConfig } = this.props;
    const styles = getStyle(this.props, this.context, this.state);
    // TODO: Enter で実行か Shift-Enter で実行か
    const { sendCodeOnEnter } = loadConfig('feelesrc');
    const shootKey = sendCodeOnEnter ? 'Enter' : 'Ctrl-Enter';
    const extraKeys = {
      [shootKey]: this.shoot
    };

    return (
      <div>
        {this.state.error ? (
          <pre style={styles.error}>{this.state.error.message}</pre>
        ) : null}
        {this.state.loading ? <LinearProgress /> : null}
        <div style={styles.editor}>
          <Editor
            isSelected
            isCared
            file={this.state.file}
            getConfig={getConfig}
            codemirrorRef={ref => (this.codeMirror = ref)}
            snippets={this.props.completes}
            extraKeys={extraKeys}
            lineNumbers={false}
            findFile={this.props.findFile}
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
          <RaisedButton
            secondary
            label={localization.shotCard.restore}
            onTouchTap={this.handleRestore}
            style={styles.restore}
            disabled={!this.state.canRestore}
          />
        </div>
      </div>
    );
  }
}
