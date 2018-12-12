import React, { PureComponent } from 'react';
import { withTheme } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import { style, classes } from 'typestyle';
import Button from '@material-ui/core/Button';
import Chip from '@material-ui/core/Chip';
import ExpandMore from '@material-ui/icons/ExpandMore';
import { fade } from '@material-ui/core/styles/colorManipulator';
import { Pos } from 'codemirror';
import { includes, intersection, forEach } from 'lodash';

import { assetRegExp } from '../../utils/keywords';
import replaceExistConsts from '../../utils/replaceExistConsts';
import AssetButton from './AssetButton';

const cn = {
  in: style({
    top: '50vh'
  }),
  out: style({
    top: '100vh'
  }),
  label: style({
    flex: '0 0 100%',
    color: 'white',
    textAlign: 'center',
    marginTop: 16,
    fontWeight: 600
  }),
  wrapper: style({
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center'
  }),
  closer: style({
    width: '100%'
  })
};
const getCn = ({ theme }) => ({
  root: style({
    position: 'fixed',
    width: '100%',
    height: '50vh',
    zIndex: theme.zIndex.modal - 1,
    left: 0,
    transition: theme.transitions.create('top'),
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: fade(theme.palette.text.primary, 0.75)
  }),
  scroller: style({
    flex: 1,
    overflowX: 'auto',
    overflowY: 'scroll',
    boxSizing: 'border-box',
    paddingBottom: 24,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0
  }),
  scopeWrapper: style({
    color: theme.palette.common.white,
    padding: theme.spacing.unit
  }),
  scope: style({
    padding: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    color: theme.palette.getContrastText(theme.palette.primary.main),
    backgroundColor: theme.palette.primary.main,
    borderRadius: theme.shape.borderRadius
  })
});

@withTheme()
export default class AssetPane extends PureComponent {
  static propTypes = {
    codemirror: PropTypes.object.isRequired,
    theme: PropTypes.object.isRequired,
    runApp: PropTypes.func.isRequired,
    findFile: PropTypes.func.isRequired,
    localization: PropTypes.object.isRequired,
    globalEvent: PropTypes.object.isRequired,
    asset: PropTypes.object.isRequired
  };

  state = {
    show: false,
    assetLineNumber: 0,
    activeCategoryIndex: -1,
    scopeIndexes: []
  };

  _widgets = new Map();

  componentDidMount() {
    const cm = this.props.codemirror;
    cm.on('change', this.handleUpdateWidget);
    cm.on('swapDoc', this.handleUpdateWidget);
    cm.on('update', this.handleRenderWidget);
    cm.on('beforeChange', this.handleIndexReplacement);
    cm.on('change', this.handleIndentLine);

    this.handleUpdateWidget(cm);
    this.handleRenderWidget(cm);
  }

  insertAsset = ({ insertCode }) => {
    const cm = this.props.codemirror;
    const { assetLineNumber } = this.state;
    const pos = new Pos(assetLineNumber, 0);
    const end = new Pos(pos.line + insertCode.split('\n').length, 0);
    insertCode += '\n';
    cm.replaceRange(insertCode, pos, pos, 'asset');
    // スクロール
    cm.scrollIntoView(
      {
        from: pos,
        to: end
      },
      10
    );
    // カーソル (挿入直後に undo したときスクロールが上に戻るのを防ぐ)
    cm.focus();
    cm.setCursor(end);
    // Pane をとじる
    this.handleClose();
    // 実行 (UIが固まらないように時間をおいている)
    this.props.runApp();
  };

  handleUpdateWidget = cm => {
    this._widgets.clear();
    for (const [line, text] of cm
      .getValue('\n')
      .split('\n')
      .entries()) {
      this.updateWidget(cm, line, text);
    }
  };

  updateWidget = (cm, line, text) => {
    const { asset } = this.props;
    // Syntax: /*+ モンスター アイテム */
    const tokens = assetRegExp.exec(text);
    if (tokens) {
      const [, _prefix, _left, _label, _right] = tokens.map(t =>
        t.replace(/\t/g, '    ')
      );
      const prefix = document.createElement('span');
      prefix.textContent = _prefix;
      prefix.classList.add('Feeles-asset-blank');
      const left = document.createElement('span');
      left.textContent = _left;
      left.classList.add('Feeles-asset-blank');
      const label = document.createElement('span');
      label.textContent = _label;
      const right = document.createElement('span');
      right.textContent = _right;
      right.classList.add('Feeles-asset-blank');
      const button = document.createElement('span');
      button.classList.add('Feeles-asset-button');
      button.onclick = event => {
        const scopeIndexes = [];
        // バーに書かれた文字列の中に scope.name があれば選択
        forEach(asset.scopes, (scope, index) => {
          if (includes(_label, scope.name)) {
            scopeIndexes.push(index);
          }
        });
        this.setState({
          show: true,
          scopeIndexes,
          assetLineNumber: line
        });
        event.stopPropagation();
      };
      button.appendChild(left);
      button.appendChild(label);
      button.appendChild(right);
      const parent = document.createElement('div');
      parent.classList.add('Feeles-widget', 'Feeles-asset');
      parent.appendChild(prefix);
      parent.appendChild(button);
      this._widgets.set(line, parent);
    }
  };

  handleRenderWidget = cm => {
    // remove old widgets
    for (const widget of [...document.querySelectorAll('.Feeles-asset')]) {
      if (widget.parentNode) {
        widget.parentNode.removeChild(widget);
      }
    }
    // render new widgets
    for (const [i, element] of this._widgets.entries()) {
      // fold されていないかを確認
      const lineHandle = cm.getLineHandle(i);
      if (lineHandle.height > 0) {
        cm.addWidget(new Pos(i, 0), element);
      }
    }
  };

  handleIndexReplacement = (cm, change) => {
    if (!includes(['asset', 'paste'], change.origin)) return;

    const code = cm.getValue('\n');
    const sourceText = change.text.join('\n');
    const replacedText = replaceExistConsts(code, sourceText);
    if (sourceText !== replacedText) {
      change.update(change.from, change.to, replacedText.split('\n'));
    }
  };

  handleIndentLine = (cm, change) => {
    if (!includes(['asset', 'paste'], change.origin)) return;
    const { from } = change;
    const to = new Pos(from.line + change.text.length, 0);
    // インデント
    for (let line = from.line; line < to.line; line++) {
      cm.indentLine(line);
    }
  };

  handleClose = () => {
    this.setState({
      show: false
    });
  };

  openFile = ({ filePath, label }) => {
    if (!filePath) return;
    this.props.globalEvent.emit('message.editor', {
      data: {
        value: filePath,
        options: {
          showBackButton: true, // アセットのコードを閉じて以前のファイルに戻るボタンを表示する
          label // ↑そのボタンを、この名前で「${label}の改造をおわる」と表示
        }
      }
    });
    this.handleClose(); // Pane をとじる
  };

  render() {
    const dcn = getCn(this.props);
    const {
      asset: { scopes, buttons }
    } = this.props;
    const { show, activeCategoryIndex, scopeIndexes } = this.state;

    const showingScopes = scopes.filter((_, i) => includes(scopeIndexes, i));

    const showingButtons = buttons
      .filter(
        b => b.scopes === null || intersection(b.scopes, scopeIndexes).length
      )
      .filter(b => b.category === activeCategoryIndex);

    return (
      <div className={classes(dcn.root, show ? cn.in : cn.out)}>
        <Button
          variant="contained"
          aria-label="Close"
          className={cn.closer}
          onClick={this.handleClose}
        >
          <ExpandMore />
          とじる
        </Button>
        <div className={dcn.scopeWrapper}>
          <span className={dcn.scope}>
            {'+ ' + showingScopes.map(scope => scope.name).join(' ')}
          </span>
          <span>{`に 入れるもの`}</span>
        </div>
        <div className={dcn.scroller}>
          <div className={cn.wrapper}>
            {showingButtons.map((b, i) => (
              <AssetButton
                key={i}
                name={b.name}
                description={b.description}
                iconUrl={b.iconUrl}
                insertCode={b.insertCode}
                moduleCode={b.moduleCode}
                filePath={b.filePath}
                insertAsset={() => this.insertAsset(b)}
                openFile={() => this.openFile(b)}
                findFile={this.props.findFile}
                localization={this.props.localization}
                globalEvent={this.props.globalEvent}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }
}
