import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import Card from '../CardWindow';
import { CardText, CardActions } from '@material-ui/core/Card';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';

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
    setCardVisibility: PropTypes.func.isRequired,
    cardProps: PropTypes.object.isRequired,
    globalEvent: PropTypes.object.isRequired
  };

  state = {
    selectedFile: null,
    completes: []
  };

  componentDidMount() {
    const { globalEvent } = this.props;
    globalEvent.on('message.complete', this.handleComplete);
    globalEvent.on('message.readme', this.handleReadme);

    try {
      const { init } = this.props.cardProps.ReadmeCard;
      if (init && init.fileName) {
        this.setState({
          selectedFile: this.props.findFile(init.fileName)
        });
      }
    } catch (e) {
      // continue regardless of error
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.files !== this.props.files) {
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
      this.props.setCardVisibility('ReadmeCard', true);
    } else {
      // feeles.closeReadme()
      this.props.setCardVisibility('ReadmeCard', false);
    }
  };

  handleSelect = event => {
    this.setState({
      selectedFile: this.resolveFile(event.target.value)
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
      <Select
        key="dropDown"
        value={selectedFile.key}
        style={styles.dropDown}
        underlineStyle={styles.underline}
        onChange={this.handleSelect}
      >
        {markdowns.map(file => (
          <MenuItem key={file.key} value={file.key}>
            {file.header}
          </MenuItem>
        ))}
      </Select>
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
      <Card
        icon={this.props.localization.readmeCard.title}
        {...this.props.cardPropsBag}
        fit
      >
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
