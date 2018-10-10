import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import beautify from 'js-beautify';
import Button from '@material-ui/core/Button';
import LinearProgress from '@material-ui/core/LinearProgress';
import AvStop from '@material-ui/icons/Stop';
import red from '@material-ui/core/colors/red';
import ContentReply from '@material-ui/icons/Reply';

import { SourceFile } from '../../File/';
import Editor from '../EditorCard/Editor';
import excessiveCare from './excessiveCare';

const getStyle = (props, context, state) => {
  const { palette, transitions } = context.muiTheme;
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
      height,
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
      height: '2.25em',
      marginBottom: '0.25em'
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
      backgroundColor: red['50'],
      color: red['500'],
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
    fileView: PropTypes.object.isRequired,
    files: PropTypes.array.isRequired,
    findFile: PropTypes.func.isRequired,
    localization: PropTypes.object.isRequired,
    getConfig: PropTypes.func.isRequired,
    loadConfig: PropTypes.func.isRequired,
    file: PropTypes.object,
    completes: PropTypes.array,
    globalEvent: PropTypes.object.isRequired,
    handleSetLinkObjects: PropTypes.func.isRequired
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
    file: this.props.file || SourceFile.shot(''),
    cardAnchorEl: null
  };

  componentDidMount() {
    this.codeMirror.on('beforeChange', excessiveCare);
    this.codeMirror.on('change', this.handleChange);
    this.codeMirror.on('swapDoc', this.handleChange);
    this.codeMirror.on('viewportChange', this.handleViewportChange);
    this.codeMirror.on('swapDoc', this.handleViewportChange);
    this.handleViewportChange(this.codeMirror);
    this.props.globalEvent.on('message.runCode', this.handleShot);
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.file !== this.props.file) {
      const file = this.props.file || SourceFile.shot('');
      this.setState({ file });
    }

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

    // ShotCard の中にある最も下の要素を取得する
    const cardAnchorEl = document.querySelector('#ShotCard-BottomAnchor');
    if (!prevState.cardAnchorEl && cardAnchorEl) {
      this.setState({ cardAnchorEl });
    }
  }

  componentWillUnmount() {
    this.props.globalEvent.off('message.runCode', this.handleShot);
  }

  handleShot = async () => {
    if (this.state.shooting) return;
    await this.shotCode();
    this.setState({ shooting: true });
  };

  handleChange = cm => {
    const canRestore = cm.getValue() !== this.state.file.text;
    this.setState({ canRestore });
  };

  handleRestore = () => {
    this.codeMirror.setValue(this.state.file.text);
  };

  async shotCode() {
    let text = this.codeMirror
      ? this.codeMirror.getValue('\n')
      : this.state.file.text;

    // コードのフォーマット
    if (this.props.loadConfig('feelesrc').formatOnSendCode || false) {
      // import .jsbeautifyrc
      let configs = this.props.loadConfig('jsbeautifyrc');
      const formatted = beautify(text, configs.js || {});
      this.codeMirror.setValue(formatted);
    }

    // コードをファイルにする
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
    let height = cm.heightAtLine(lastLine, 'local');
    // もしエディタの描画領域が広過ぎて ShotCard が画面からはみ出すなら, height を更新しない
    const { cardAnchorEl } = this.state;
    if (cardAnchorEl) {
      const { offsetParent, offsetTop } = cardAnchorEl;
      const appendedHeight = height - this.state.height;
      const containerHeight =
        offsetParent.clientHeight -
        parseInt(offsetParent.style.paddingTop, 10) -
        parseInt(offsetParent.style.paddingBottom, 10);
      if (offsetTop + appendedHeight >= containerHeight) {
        return;
      }
    }

    this.setState({ height });
  };

  render() {
    const { localization, getConfig, loadConfig } = this.props;
    const styles = getStyle(this.props, this.context, this.state);
    // TODO: Enter で実行か Shift-Enter で実行か
    const { sendCodeOnEnter } = loadConfig('feelesrc');
    const shootKey = sendCodeOnEnter ? 'Enter' : 'Ctrl-Enter';
    const extraKeys = {
      [shootKey]: this.handleShot
    };

    return (
      <div>
        {this.state.error ? (
          <pre style={styles.error}>{this.state.error.message}</pre>
        ) : null}
        {this.state.loading ? <LinearProgress /> : null}
        <div style={styles.menu}>
          <Button
            variant="raised"
            color="primary"
            label={localization.shotCard.button}
            icon={this.state.shooting ? <AvStop /> : <ContentReply />}
            labelPosition="before"
            disabled={this.state.shooting}
            onClick={this.handleShot}
            style={styles.shoot}
          />
          <span style={styles.label}>{localization.shotCard.shoot}</span>
          <div style={{ flex: 1 }} />
          <Button
            variant="raised"
            color="secondary"
            label={localization.shotCard.restore}
            onClick={this.handleRestore}
            style={styles.restore}
            disabled={!this.state.canRestore}
          />
        </div>
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
            loadConfig={this.props.loadConfig}
            fileView={this.props.fileView}
            handleSetLinkObjects={this.props.handleSetLinkObjects}
          />
        </div>
      </div>
    );
  }
}
