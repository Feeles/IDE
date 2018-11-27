import React, { PureComponent } from 'react';
import { withTheme } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import { style, classes } from 'typestyle';
import Button from '@material-ui/core/Button';
import ExpandMore from '@material-ui/icons/ExpandMore';
import { fade } from '@material-ui/core/styles/colorManipulator';
import { emphasize } from '@material-ui/core/styles/colorManipulator';
import { Pos } from 'codemirror';
import includes from 'lodash/includes';

import { assetRegExp } from '../../utils/keywords';
import replaceExistConsts from '../../utils/replaceExistConsts';
import AssetButton from './AssetButton';

//classes(, assetCodeInserted && assetCodeInsertedCn)
const cn = {
  in: style({
    top: '50vh'
  }),
  out: style({
    top: '100vh'
  }),
  assetCode: style({
    opacity: 1,
    transition: 'opacity 300ms'
    // $nest: {
    //   [`.${assetCodeInsertedCn} &`]: {
    //     backgroundColor: 'rgba(0,0,0,1)',
    //     opacity: 0
    //   }
    // }
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
const getCn = props => ({
  root: style({
    position: 'fixed',
    width: '100%',
    height: '50vh',
    zIndex: props.theme.zIndex.modal - 1,
    left: 0,
    transition: props.theme.transitions.create('top'),
    display: 'flex',
    flexDirection: 'column'
  }),
  scroller: style({
    flex: 1,
    overflowX: 'auto',
    overflowY: 'scroll',
    boxSizing: 'border-box',
    paddingBottom: 24,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    backgroundColor: fade(
      emphasize(props.theme.palette.background.paper, 0.75),
      0.55
    )
  })
});

@withTheme()
export default class AssetPane extends PureComponent {
  static propTypes = {
    codemirror: PropTypes.object.isRequired,
    theme: PropTypes.object.isRequired,
    fileView: PropTypes.object.isRequired,
    scope: PropTypes.string,
    loadConfig: PropTypes.func.isRequired,
    runApp: PropTypes.func.isRequired,
    findFile: PropTypes.func.isRequired,
    localization: PropTypes.object.isRequired
  };

  state = {
    assets: {},
    assetLineNumber: 0,
    scope: null, // "モンスター" など
    assetCodeInserted: false
  };

  _widgets = new Map();

  componentDidMount() {
    this.setState({
      assets: this.props.loadConfig('asset')
    });
    const cm = this.props.codemirror;
    cm.on('change', this.handleUpdateWidget);
    cm.on('swapDoc', this.handleUpdateWidget);
    cm.on('update', this.handleRenderWidget);
    cm.on('beforeChange', this.handleIndexReplacement);

    this.handleUpdateWidget(cm);
    this.handleRenderWidget(cm);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.fileView !== this.props.fileView) {
      this.setState({
        assets: this.props.loadConfig('asset')
      });
    }
  }

  insertAsset = ({ code }) => {
    const cm = this.props.codemirror;
    const { assetLineNumber } = this.state;
    const pos = new Pos(assetLineNumber, 0);
    const end = new Pos(pos.line + code.split('\n').length, 0);
    code += '\n';
    cm.replaceRange(code, pos, pos, 'asset');
    // トランジション（フェードイン）

    this.setState(
      {
        assetCodeInserted: true
      },
      () => {
        const fadeInMarker = cm.markText(pos, end, {
          className: cn.assetCode,
          clearOnEnter: true
        });
        fadeInMarker.on('clear', () => console.log('cleared'));
        console.log(fadeInMarker);
        console.log(document.querySelector(`.${cn.assetCode}`));
      }
    );
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
    setTimeout(this.props.runApp, 1000);
  };

  emphasizeTextMarker = async textMarker => {
    const { transitions } = this.props.theme;

    const begin = {
      className: textMarker.className,
      style: 'opacity: 0; background-color: rgba(0,0,0,1)'
    };
    const end = {
      className: textMarker.className,
      style: `opacity: 1; background-color: rgba(0,0,0,0.1); transition: ${transitions.create()}`
    };
    textMarker.on('clear', () => {
      this.setState(prevState => ({
        classNameStyles: prevState.classNameStyles.filter(
          item => begin !== item && end !== item
        )
      }));
    });

    this.setState(prevState => ({
      classNameStyles: prevState.classNameStyles.concat(begin)
    }));
    await wait(500);
    this.setState(prevState => ({
      classNameStyles: prevState.classNameStyles.map(item =>
        item === begin ? end : item
      )
    }));
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
    // Syntax: /*+ モンスター アイテム */
    const asset = assetRegExp.exec(text);
    if (asset) {
      const [, _prefix, _left, _label, _right] = asset.map(t =>
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
      button.onclick = () => {
        this.setState({
          scope: _label.substr(1).trim(),
          assetLineNumber: line
        });
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
      scope: null
    });
  };

  renderEachLabel(label) {
    const items = this.state.assets[label];
    if (!items) return null;

    return (
      <div key={label} className={cn.wrapper}>
        <div className={cn.label}>{label}</div>
        {items.map((item, i) => (
          <AssetButton
            {...item}
            key={i}
            onClick={this.insertAsset}
            findFile={this.props.findFile}
            localization={this.props.localization}
          />
        ))}
      </div>
    );
  }

  render() {
    const dcn = getCn(this.props);
    const { scope } = this.state;

    // e.g. scope === 'モンスター アイテム'
    const labels = scope ? scope.trim().split(' ') : [];

    return (
      <div className={classes(dcn.root, scope ? cn.in : cn.out)}>
        <Button
          variant="contained"
          aria-label="Close"
          className={cn.closer}
          onClick={this.handleClose}
        >
          <ExpandMore />
          とじる
        </Button>
        <div className={dcn.scroller}>
          {labels.map(label => this.renderEachLabel(label))}
        </div>
      </div>
    );
  }
}

function wait(millisec) {
  return new Promise(resolve => {
    setTimeout(resolve, millisec);
  });
}
