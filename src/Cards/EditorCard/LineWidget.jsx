import React from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import { style } from 'typestyle';
import { withTheme, Button } from '@material-ui/core';
import Backspace from '@material-ui/icons/Backspace';
import { Pos } from 'codemirror';
import includes from 'lodash/includes';
import Chip from '@material-ui/core/Chip';
import SubdirectoryArrowRight from '@material-ui/icons/SubdirectoryArrowRight';

import isNotDeletableLine from './isNotDeletableLine';

const dummyNode = document.createElement('div');

const cn = {
  background: style({
    backgroundColor: 'rgba(0, 0, 0, 0.04)'
  }),
  blank: style({
    flex: 1
  }),
  parent: style({
    display: 'flex',
    alignItems: 'center',
    position: 'relative',
    width: '100%'
  })
};

const getCn = (props, state) => ({
  button: style({
    margin: props.theme.spacing.unit
  }),
  copy: style({
    transform: `rotateX(${state.above ? 180 : 0}deg)` // copy してくる方向
  }),
  paste: style({
    transform: `rotateZ(90deg) rotateY(${state.above ? 180 : 0}deg)` // paste する方向
  }),
  clipboard: style({
    transition: props.theme.transitions.create(),
    backgroundColor: state.clipboard ? null : 'transparent',
    color: state.clipboard
      ? props.theme.palette.text.primary
      : props.theme.palette.text.disabled
  })
});

@withTheme()
export default class LineWidget extends React.Component {
  static propTypes = {
    show: PropTypes.bool.isRequired,
    codemirror: PropTypes.object.isRequired,
    runApp: PropTypes.func.isRequired,
    localization: PropTypes.object.isRequired
  };

  state = {
    line: -1,
    above: false,
    widget: null,
    notDeletable: false,
    text: '',
    clipboard: null
  };

  componentDidMount() {
    const { codemirror } = this.props;

    codemirror.on('cursorActivity', this.handleLineWidget);
    codemirror.on('blur', this.handleBlur);
  }

  componentDidUpdate(prevProps) {
    const { line } = this.state;
    if (!prevProps.show && this.props.show && line > -1) {
      this.setLineWidget(this.props.codemirror, line);
    }
    if (prevProps.show && !this.props.show && line > -1) {
      this.handleDone();
    }
  }

  setLineWidget(cm, line) {
    if (!this.props.show) return;
    if (this.state.line > -1) {
      cm.removeLineClass(this.state.line, 'wrap', cn.background); // 背景色を戻す
    }
    cm.addLineClass(line, 'wrap', cn.background); // 背景色をつける

    if (this.state.widget) {
      this.state.widget.clear();
    }
    const parent = document.createElement('div');
    parent.classList.add(cn.parent);
    const above =
      this.state.line > -1
        ? line === this.state.line
          ? this.state.above
          : line > this.state.line
        : false;
    const widget = cm.addLineWidget(line, parent, {
      noHScroll: true,
      above
    });

    this.setState({
      widget,
      line,
      above,
      text: widget.line.text,
      notDeletable: isNotDeletableLine(cm.getLine(line)) // 削除できるかどうか
    });
  }

  handleLineWidget = cm => {
    if (includes(cm.getSelection(), '\n')) return; // 複数行選択されている場合は omit

    // Delete line button
    const cursor = cm.getCursor();
    if (!cursor.line && !cursor.ch && cursor.sticky === null) {
      // runApp した時に0行目に line widget が移るのを防ぐ
      // setValue すると LineWidget が消えるみたいなので作り直す
      this.setLineWidget(cm, this.state.line);
      return;
    }
    if (this.state.line !== cursor.line) {
      // 行が変わっていたら LineWidget も作り直す必要がある
      this.setLineWidget(cm, cursor.line);
    }
  };

  handleDone = () => {
    // 現在の LineWidget を消す
    const { line, widget } = this.state;
    if (line > -1) {
      this.props.codemirror.removeLineClass(line, 'wrap', cn.background); // 背景色を戻す
    }
    if (widget) {
      widget.clear();
    }
    this.setState({
      widget: null,
      line: -1
    });
  };

  handleLineDeleteClick = () => {
    const cm = this.props.codemirror;
    const { line } = this.state;
    const cursor = cm.getCursor();

    const from = new Pos(line, 0);
    const to = new Pos(line + 1, 0);
    cm.replaceRange('', from, to, 'change'); // 1行削除

    cm.focus(); // ボタンを押したのでフォーカスが外れている. それを戻す
    cm.setCursor(new Pos(line, cursor.ch)); // カーソルを新しい位置に
    this.setLineWidget(cm, line); // 次の行(消したのでlineは同じ)に移動
  };

  handleBlur = cm => {
    // 背景色だけが残らないようにする
    if (!this.props.show && this.state.line > -1) {
      cm.removeLineClass(this.state.line, 'wrap', cn.background); // 背景色を戻す
    }
  };

  handleLineCopyClick = () => {
    const cm = this.props.codemirror;
    const { line } = this.state;

    const text = cm.getLine(line);
    this.setState({
      clipboard: text
    });
    cm.focus();
  };

  handleLinePasteClick = () => {
    const cm = this.props.codemirror;
    const { line, above, clipboard } = this.state;
    if (!clipboard) return;

    const pos = new Pos(above ? line : line + 1, 0);
    cm.replaceRange(clipboard + '\n', pos, pos);
    this.setState({
      clipboard: null
    });
    this.props.runApp();
  };

  clearClipboard = () => {
    this.setState({ clipboard: null });
  };

  render() {
    const { widget, clipboard, text } = this.state;
    if (!this.props.show) return null;
    const node = widget ? widget.node : dummyNode;

    const dcn = getCn(this.props, this.state);
    const chipText = clipboard || text;

    return ReactDOM.createPortal(
      <>
        {!clipboard ? (
          <Button
            variant="text"
            size="small"
            className={dcn.button}
            onClick={this.handleLineCopyClick}
            disabled={!text || this.state.notDeletable}
          >
            <SubdirectoryArrowRight className={dcn.copy} fontSize="small" />
            {this.props.localization.editorCard.copyLine}
          </Button>
        ) : (
          <Button
            variant="text"
            size="small"
            className={dcn.button}
            onClick={this.handleLinePasteClick}
          >
            <SubdirectoryArrowRight className={dcn.paste} fontSize="small" />
            {this.props.localization.editorCard.pasteLine}
          </Button>
        )}
        {chipText && (
          <Chip
            label={chipText}
            className={dcn.clipboard}
            onDelete={clipboard ? this.clearClipboard : undefined}
          />
        )}
        <div className={cn.blank} />
        <Button
          variant="text"
          size="small"
          className={dcn.button}
          onClick={this.handleLineDeleteClick}
          disabled={this.state.notDeletable}
        >
          <Backspace fontSize="small" />
          {this.props.localization.editorCard.deleteLine}
        </Button>
      </>,
      node
    );
  }
}
