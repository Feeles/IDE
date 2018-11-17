import { Pos, countColumn } from 'codemirror';

import { separate } from '../File/';

export default class Snippet {
  constructor(props) {
    this.key = getUniqueId();
    this.props = Object.freeze(props);
    this._separate = separate(props.name);
  }

  get text() {
    if (!this.props.body && typeof this.props.text === 'string') {
      return this.props.text;
    } else if (Array.isArray(this.props.body)) {
      return this.props.body.map(text => text.replace(/\\t/g, '\t')).join('\n');
    } else {
      return this.props.body.replace(/\\n/g, '\n').replace(/\\t/g, '\t');
    }
  }

  get prefix() {
    return this.props.prefix || '';
  }

  get description() {
    return this.props.description;
  }

  get descriptionMoreURL() {
    return this.props.descriptionMoreURL;
  }

  get leftLabel() {
    return this.props.leftLabelHTML || this.props.leftLabel || '';
  }

  get rightLabel() {
    return this.props.rightLabelHTML || this.props.rightLabel || '';
  }

  get plain() {
    return this._separate.plain;
  }

  get fileKey() {
    return this.props.fileKey;
  }

  render(element) {
    element.textContent = this.props.prefix + ' ' + this.props.description;
    return element;
  }

  hint(cm, self, data) {
    const from = self.asset ? new Pos(self.from.line + 1, 0) : self.from;
    const to = self.asset ? from : self.to;
    const text = self.asset ? data.text + '\n' : data.text;
    const prefix = cm.getLine(from.line);

    cm.replaceRange(text, from, to, 'complete');

    // 挿入位置のタブに合わせるインデント
    const indent = countColumn(prefix, null, 4);
    const end = from.line + text.split('\n').length + (self.asset ? -1 : 0);
    for (let line = from.line + 1; line < end; line++) {
      const pos = new Pos(line, 0);
      cm.replaceRange('\t'.repeat(indent / 4), pos, pos, '+input');
    }

    const endLine = from.line + length - 1;
    const endCh = cm.getLine(endLine).length;

    return {
      from,
      to: new Pos(endLine, endCh)
    };
  }
}

const getUniqueId = (id => () => 'Snippet__' + ++id)(0);
