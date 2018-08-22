import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import Card from '../CardWindow';
import { CardText, CardActions } from 'material-ui/Card';
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';
import MapsMap from 'material-ui/svg-icons/maps/map';

import Readme from './Readme';
import EditFile from '../EditFile';
import shallowEqual from '../../utils/shallowEqual';

export default class ReadmeCard extends PureComponent {
  static propTypes = {
    cardPropsBag: PropTypes.object.isRequired,
    files: PropTypes.array.isRequired,
    findFile: PropTypes.func.isRequired,
    selectTab: PropTypes.func.isRequired,
    addFile: PropTypes.func.isRequired,
    getConfig: PropTypes.func.isRequired,
    localization: PropTypes.object.isRequired,
    setLocation: PropTypes.func.isRequired,
    updateCard: PropTypes.func.isRequired,
    cards: PropTypes.object.isRequired,
    globalEvent: PropTypes.object.isRequired
  };

  state = {
    selectedFile: null,
    completes: []
  };

  static icon() {
    return <MapsMap />;
  }

  componentWillMount() {
    const { globalEvent } = this.props;
    globalEvent.on('message.complete', this.handleComplete);
    globalEvent.on('message.readme', this.handleReadme);

    try {
      const { init } = this.props.cards.ReadmeCard;
      if (init && init.fileName) {
        this.setState({
          selectedFile: this.props.findFile(init.fileName)
        });
      }
    } catch (e) {
      // continue regardless of error
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
  }

  handleComplete = event => {
    const { value } = event.data;
    if (!shallowEqual(value, this.state.completes)) {
      this.setState({
        completes: value
      });
    }
  };

  handleReadme = event => {
    const { value } = event.data;
    if (value) {
      // feeles.openReamde()
      const selectedFile = this.props.findFile(value);
      if (!selectedFile) {
        throw new Error(`Not Found Error: feeles.openReamde("${value}")`);
      }
      this.setState({ selectedFile });
      this.props.updateCard('ReadmeCard', { visible: true });
    } else {
      // feeles.closeReadme()
      this.props.updateCard('ReadmeCard', { visible: false });
    }
  };

  handleSelect = (event, index, value) => {
    this.setState({
      selectedFile: this.resolveFile(value)
    });
  };

  resolveFile(key) {
    if (!key) {
      return null;
    }
    return this.props.findFile(item => item.key === key);
  }

  renderDropDownMenu() {
    const { localization } = this.props;
    const { selectedFile } = this.state;

    const markdowns = this.props.files
      .filter(item => item.is('markdown'))
      .sort((a, b) => (a.header > b.header ? 1 : -1));

    const styles = {
      index: {
        marginLeft: 16,
        marginRight: -8,
        fontSize: '.5rem'
      },
      dropDown: {
        verticalAlign: 'bottom'
      },
      underline: {
        display: 'none'
      }
    };

    return [
      <span key="index" style={styles.index}>
        {localization.readmeCard.index}
      </span>,
      <DropDownMenu
        key="dropDown"
        value={selectedFile.key}
        style={styles.dropDown}
        underlineStyle={styles.underline}
        onChange={this.handleSelect}
      >
        {markdowns.map(file => (
          <MenuItem key={file.key} value={file.key} primaryText={file.header} />
        ))}
      </DropDownMenu>
    ];
  }

  render() {
    const { localization } = this.props;
    const { selectedFile } = this.state;

    if (!selectedFile) {
      return null;
    }

    const styles = {
      text: {
        flex: 1,
        paddingTop: 0,
        overflowX: 'hidden',
        overflowY: 'scroll'
      },
      actions: {
        flex: 0
      }
    };
    return (
      <Card icon={ReadmeCard.icon()} {...this.props.cardPropsBag} fit>
        <CardText style={styles.text}>
          <Readme
            file={selectedFile}
            selectTab={this.props.selectTab}
            findFile={this.props.findFile}
            addFile={this.props.addFile}
            getConfig={this.props.getConfig}
            localization={this.props.localization}
            completes={this.state.completes}
            setLocation={this.props.setLocation}
          />
        </CardText>
        <CardActions style={styles.actions}>
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
