import React, { PureComponent, PropTypes } from 'react';
import Card from './CardWindow';
import {CardText, CardActions} from 'material-ui/Card';
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';


import ReadmePane from '../ReadmePane/';
import { SourceFile } from '../File/';
import EditFile from './EditFile';
import shallowEqual from '../utils/shallowEqual';

export default class ReadmeCard extends PureComponent {

  static propTypes = {
    cardPropsBag: PropTypes.object.isRequired,
    files: PropTypes.array.isRequired,
    findFile: PropTypes.func.isRequired,
    selectTab: PropTypes.func.isRequired,
    addFile: PropTypes.func.isRequired,
    getConfig: PropTypes.func.isRequired,
    localization: PropTypes.object.isRequired,
    port: PropTypes.object,
    setLocation: PropTypes.func.isRequired,
    updateCard: PropTypes.func.isRequired,
  };

  state = {
    selectedFile: null,
    completes: [],
  };

  componentWillMount() {
    const {fileName} = this.props.getConfig('card').ReadmeCard.init || {};
    if (fileName) {
      this.setState({
        selectedFile: this.props.findFile(fileName)
      });
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.files !== nextProps.files) {
      // TODO: watch file
      if (this.state.selectedFile) {
        this.setState({
          selectedFile: this.resolveFile(this.state.selectedFile.key)
        });
      }
    }

    if (this.props.port !== nextProps.port) {
      if (this.props.port) {
        this.props.port.removeEventListener('message', this.handleMessage);
      }
      if (nextProps.port) {
        nextProps.port.addEventListener('message', this.handleMessage);
      }
    }
  }

  handleMessage = (event) => {
    if (!event.data || !event.data.query) return;
    const { query, value } = event.data;

    // Completes
    if (query === 'complete') {
      if (!shallowEqual(value, this.state.completes)) {
        this.setState({
          completes: value,
        });
      }
    }
    if (query === 'readme' && value) {
      // feeles.openReamde()
      const selectedFile = this.props.findFile(value);
      if (!selectedFile) {
        throw `Not Found Error: feeles.openReamde("${value}")`;
      }
      this.setState({ selectedFile });
      this.props.updateCard('ReadmeCard', {visible: true});
    } else if (query === 'readme') {
      // feeles.closeReadme()
      this.props.updateCard('ReadmeCard', {visible: false});
    }
  };

  handleShot = (text) => {
    if (this.props.port) {
      const babelrc = this.props.getConfig('babelrc');
      return Promise.resolve()
        .then(() => SourceFile.shot(text).babel(babelrc))
        .then((file) => {
          this.props.port.postMessage({
            query: 'shot',
            value: file.serialize(),
          });
        });
    }
    return Promise.reject();
  };

  handleSelect = (event, index, value) => {
    this.setState({
      selectedFile: this.resolveFile(value),
    });
  };

  resolveFile(key) {
    if (!key) {
      return null;
    }
    return this.props.findFile((item) => item.key === key);
  }

  renderDropDownMenu() {
    const {
      localization,
    } = this.props;
    const {
      selectedFile,
    } = this.state;

    const markdowns = this.props.files
      .filter((item) => item.is('markdown'))
      .sort((a, b) => a.header > b.header ? 1 : -1);

    const styles = {
      index: {
        marginLeft: 16,
        marginRight: -8,
        fontSize: '.5rem',
      },
      dropDown: {
        verticalAlign: 'bottom',
      },
      underline: {
        display: 'none',
      },
    };

    return [
      <span key="index" style={styles.index}>
      {localization.readmeCard.index}
      </span>,
      <DropDownMenu key="dropDown"
        value={selectedFile.key}
        style={styles.dropDown}
        underlineStyle={styles.underline}
        onChange={this.handleSelect}
      >
      {markdowns.map((file) => (
        <MenuItem
          key={file.key}
          value={file.key}
          primaryText={file.header}
        />
      ))}
      </DropDownMenu>
    ];
  }

  render() {
    const {
      localization,
    } = this.props;
    const {
      selectedFile,
    } = this.state;

    if (!selectedFile) {
      return null;
    }

    const styles = {
      text: {
        paddingTop: 0,
        maxHeight: '65vh',
        overflowX: 'hidden',
        overflowY: 'scroll',
      },
    };
    return (
      <Card initiallyExpanded {...this.props.cardPropsBag}>
        <CardText
          expandable
          style={styles.text}
        >
          <ReadmePane
            file={selectedFile}
            selectTab={this.props.selectTab}
            findFile={this.props.findFile}
            addFile={this.props.addFile}
            getConfig={this.props.getConfig}
            localization={this.props.localization}
            completes={this.state.completes}
            onShot={this.handleShot}
            setLocation={this.props.setLocation}
          />
        </CardText>
        <CardActions expandable >
        {this.renderDropDownMenu()}
          <EditFile
            fileKey={selectedFile.key}
            findFile={this.props.findFile}
            selectTab={this.props.selectTab}
            localization={localization}
          />
        </CardActions>
      </Card>
    );
  }
}
