import React, { PureComponent, PropTypes } from 'react';
import IconButton from 'material-ui/IconButton';
import Chip from 'material-ui/Chip';
import Card from './CardWindow';
import {CardActions, CardText} from 'material-ui/Card';
import transitions from 'material-ui/styles/transitions';
import { fade } from 'material-ui/utils/colorManipulator';


import SnippetPane from '../SnippetPane/';
import { configs } from '../File/';
import { commonRoot } from './commonStyles';
import EditFile from './EditFile';

export default class SnippetCard extends PureComponent {

  static propTypes = {
    cardPropsBag: PropTypes.object.isRequired,
    tabs: PropTypes.array.isRequired,
    findFile: PropTypes.func.isRequired,
    selectTab: PropTypes.func.isRequired,
    localization: PropTypes.object.isRequired,
    updateCard: PropTypes.func.isRequired,
  };

  static contextTypes = {
    muiTheme: PropTypes.object.isRequired,
  };

  state = {
    snippets: [],
    snippetFiles: [],
    fileKey: '',
  };

  componentDidMount() {
    const first = this.state.snippetFiles[0];
    if (first) {
      this.setState({ fileKey: first.key });
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.tabs !== nextProps.tabs) {
      const selected = nextProps.tabs
        .find((item) => item.isSelected);
      const snippets = selected && this.props.getConfig('snippets')(selected.file);

      if (snippets && snippets.length) {
        const snippetFiles = this.findSnippetFiles(snippets);

        this.setState({
          snippets,
          snippetFiles,
          fileKey: snippetFiles[0] && snippetFiles[0].key,
        });

        this.props.updateCard('SnippetCard', {visible:true});

      } else {
        this.setState({
          snippets: [],
          snippetFiles: [],
          fileKey: '',
        });
      }
    }
  }

  findSnippetFiles(snippets) {
    return snippets
      .map((item) => item.fileKey)
      .filter((key, i, array) => array.indexOf(key) === i)
      .map((item) => this.props.findFile((file) => file.key === item));
  }

  renderChips() {
    const {
      palette,
    } = this.context.muiTheme;
    const styles = {
      bar: {
        display: 'flex',
        flexWrap: 'wrap',
      },
      chip: {
        marginRight: 2,
        marginBottom: 4,
      },
      label: {
        fontSize: '.8rem',
        lineHeight: '1.4rem',
      },
      activeColor: fade(palette.primary1Color, 0.3),
    };

    return (
      <div style={styles.bar}>
      {this.state.snippetFiles.map((file) => (
        <Chip
          key={file.key}
          backgroundColor={file.key === this.state.fileKey ? styles.activeColor : null}
          style={styles.chip}
          labelStyle={styles.label}
          onTouchTap={() => this.setState({ fileKey: file.key })}
        >{file.plane}</Chip>
      ))}
      </div>
    );
  }

  render() {
    const {
      localization,
    } = this.props;

    const subtitle = this.state.fileKey ?
      localization.snippetCard.subtitle :
      localization.snippetCard.fileNotSelected;

    return (
      <Card initiallyExpanded {...this.props.cardPropsBag}>
        <CardActions expandable >
        {this.renderChips()}
        </CardActions>
        <CardText expandable >
          <SnippetPane
            snippets={this.state.snippets}
            fileKey={this.state.fileKey}
            findFile={this.props.findFile}
            localization={localization}
          />
        </CardText>
        <CardActions expandable >
          <EditFile
            fileKey={this.state.fileKey}
            findFile={this.props.findFile}
            selectTab={this.props.selectTab}
            localization={localization}
          />
        </CardActions>
      </Card>
    );
  }
}
