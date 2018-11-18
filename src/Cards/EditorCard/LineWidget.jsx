import React from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import { style } from 'typestyle';
import { withTheme, Button, IconButton } from '@material-ui/core';
import Close from '@material-ui/icons/Close';
import Backspace from '@material-ui/icons/Backspace';
import { Pos } from 'codemirror';

import isNotDeletableLine from './isNotDeletableLine';

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

const getCn = props => ({
  button: style({
    margin: props.theme.spacing.unit
  })
});

@withTheme()
export default class LineWidget extends React.Component {
  static propTypes = {
    codemirror: PropTypes.object.isRequired,
    localization: PropTypes.object.isRequired
  };

  state = {
    enabled: true,
    line: -1,
    widget: null,
    notDeletable: false
  };

  componentDidMount() {
    const { codemirror } = this.props;

    codemirror.on('cursorActivity', this.handleLineWidget);
    codemirror.on('blur', this.handleBlur);
  }

  setLineWidget(cm, line) {
    if (this.state.line > -1) {
      cm.removeLineClass(this.state.line, 'wrap', cn.background); // 背景色を戻す
    }
    cm.addLineClass(line, 'wrap', cn.background); // 背景色をつける

    if (this.state.widget) {
      this.state.widget.clear();
    }
    const parent = document.createElement('div');
    parent.classList.add(cn.parent);
    const widget = cm.addLineWidget(line, parent, {
      noHScroll: true,
      above: this.state.line > -1 ? line > this.state.line : false
    });

    this.setState({
      widget,
      line,
      notDeletable: isNotDeletableLine(cm.getLine(line)) // 削除できるかどうか
    });
  }

  handleLineWidget = cm => {
    // Delete line button
    const cursor = cm.getCursor();
    if (this.state.line !== cursor.line) {
      // 行が変わっていたら LineWidget も作り直す必要がある
      this.setLineWidget(cm, cursor.line);
    }
  };

  handleRemoveLineWidget = () => {
    if (this.state.line >= 0) {
      this.props.codemirror.removeLineClass(
        this.state.line,
        'wrap',
        cn.background
      ); // 背景色を戻す
    }
    if (this.state.widget) {
      this.state.widget.clear();
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

  handleDisable = () => {
    this.setState({
      enabled: false
    });
  };

  handleBlur = cm => {
    // 背景色だけが残らないようにする
    if (!this.state.enabled && this.state.line > -1) {
      cm.removeLineClass(this.state.line, 'wrap', cn.background); // 背景色を戻す
    }
  };

  render() {
    if (!this.state.enabled) return null;
    if (!this.state.widget) return null;
    const { node } = this.state.widget;
    if (!node) return null;

    const dcn = getCn(this.props, this.state);

    return ReactDOM.createPortal(
      <>
        <div className={cn.blank} />
        <Button
          variant="outlined"
          size="small"
          className={dcn.button}
          onClick={this.handleLineDeleteClick}
          disabled={this.state.notDeletable}
        >
          <Backspace fontSize="small" />
          {this.props.localization.editorCard.deleteLine}
        </Button>
        <div className={cn.blank} />
        <IconButton onClick={this.handleDisable}>
          <Close fontSize="small" />
        </IconButton>
      </>,
      node
    );
  }
}
