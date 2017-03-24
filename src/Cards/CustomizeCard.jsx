import React, { PureComponent, PropTypes } from 'react';
import FlatButton from 'material-ui/FlatButton';
import Card from './CardWindow';
import { CardHeader } from 'material-ui/Card';
import ActionSettingsApplications from 'material-ui/svg-icons/action/settings-applications';

import { SourceFile } from '../File/';
import { commonRoot } from './commonStyles';
import EditFile from './EditFile';
import resolveOrigin from '../utils/resolveOrigin';

export default class CustomizeCard extends PureComponent {

  static propTypes = {
    cardPropsBag: PropTypes.object.isRequired,
    files: PropTypes.array.isRequired,
    getConfig: PropTypes.func.isRequired,
    localization: PropTypes.object.isRequired,
    findFile: PropTypes.func.isRequired,
    selectTab: PropTypes.func.isRequired,
    addFile: PropTypes.func.isRequired,
  };

  state = {
    editorFileKey: '',
    cssFileKey: '',
  };

  static icon() {
    return (
      <ActionSettingsApplications color="gray" />
    );
  }

  componentWillMount() {

    (async() => {

      const editorFileKey = await this.addFileIfNotExist(
        'feeles/codemirror.json',
        () => {
          const editor = this.props.getConfig('codemirror');
          return new SourceFile({
            type: 'application/json',
            name: 'feeles/codemirror.json',
            text: JSON.stringify(editor, null, '\t'),
          });
        }
      );

      const cssFileKey = await this.addFileIfNotExist(
        'feeles/codemirror.css',
        () => {
          return new SourceFile({
            type: 'text/css',
            name: 'feeles/codemirror.css',
            text: '',
          })
        }
      );

      this.setState({
        editorFileKey,
        cssFileKey,
      });

    })();

  }

  async addFileIfNotExist(name, getFile) {

    const file = this.props.findFile(name);

    if (!file) {
      const nextFile = await this.props.addFile(getFile());
      return nextFile.key;
    }

    return file.key;

  }

  componentWillReceiveProps(nextProps) {
    if (this.props.files !== nextProps.files) {
      const editorFile = this.props.findFile('feeles/codemirror.json');
      this.setState({
        editorFileKey: editorFile ? editorFile.key : '',
      });
    }
  }

  renderBlock(title, href, fileKey) {
    const {
      localization,
    } = this.props;

    const subtitle = [
      <span key={1}>{title + ' - '}</span>,
      <a key={2} href={href} target="blank">{resolveOrigin(href)}</a>
    ];

    const styles = {
      block: {
        whiteSpace: 'inherit',
      },
    };

    return (
      <CardHeader expandable
        style={styles.block}
        title={title}
        subtitle={subtitle}
      >
        <EditFile
          fileKey={fileKey}
          findFile={this.props.findFile}
          selectTab={this.props.selectTab}
          localization={localization}
        />
      </CardHeader>
    );
  }

  render() {
    const {
      localization,
    } = this.props;

    return (
      <Card initiallyExpanded icon={CustomizeCard.icon()} {...this.props.cardPropsBag}>
      {this.renderBlock(
        localization.customizeCard.editor,
        'http://codemirror.net/doc/manual.html#config',
        this.state.editorFileKey
      )}
      {this.renderBlock(
        localization.customizeCard.style,
        'http://codemirror.net/doc/manual.html#styling',
        this.state.cssFileKey
      )}
      </Card>
    );
  }
}
