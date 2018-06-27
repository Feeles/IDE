import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import Card from '../CardWindow';
import ContentReply from 'material-ui/svg-icons/content/reply';
import uniq from 'lodash/uniq';

import ShotPane from './ShotPane';
import shallowEqual from '../../utils/shallowEqual';

export default class ShotCard extends PureComponent {
  static propTypes = {
    cardPropsBag: PropTypes.object.isRequired,
    fileView: PropTypes.object.isRequired,
    updateCard: PropTypes.func.isRequired,
    files: PropTypes.array.isRequired,
    findFile: PropTypes.func.isRequired,
    localization: PropTypes.object.isRequired,
    getConfig: PropTypes.func.isRequired,
    loadConfig: PropTypes.func.isRequired,
    globalEvent: PropTypes.object.isRequired
  };

  state = {
    file: null,
    completes: [],
    footer: null
  };

  static icon() {
    return <ContentReply />;
  }

  componentWillMount() {
    const { globalEvent } = this.props;
    globalEvent.on('message.code', this.handleCode);
    globalEvent.on('message.complete', this.handleComplete);
  }

  handleCode = event => {
    const { value } = event.data;
    if (value) {
      // feeles.openCode()
      const file = this.props.findFile(value);
      this.setState({ file });
      this.props.updateCard('ShotCard', { visible: true });
    } else {
      // feeles.closeCode()
      this.props.updateCard('ShotCard', { visible: false });
    }
  };

  handleComplete = event => {
    const { value } = event.data;
    // feeles.exports
    if (!shallowEqual(value, this.state.completes)) {
      this.setState({ completes: value });
    }
  };

  handleSetLinkObjects = (linkObjects = []) => {
    const links = linkObjects.map(obj => obj.linkText);
    this.setState({
      footer: this.renderFooter(uniq(links))
    });
  };

  renderFooter(links) {
    return <div>{links.map(link => <p key={link}>{link}</p>)}</div>;
  }

  render() {
    const { visible } = this.props.cardPropsBag;

    return (
      <Card
        icon={ShotCard.icon()}
        {...this.props.cardPropsBag}
        footer={this.state.footer}
      >
        {visible ? (
          <ShotPane
            fileView={this.props.fileView}
            file={this.state.file}
            completes={this.state.completes}
            files={this.props.files}
            findFile={this.props.findFile}
            localization={this.props.localization}
            getConfig={this.props.getConfig}
            loadConfig={this.props.loadConfig}
            globalEvent={this.props.globalEvent}
            handleSetLinkObjects={this.handleSetLinkObjects}
          />
        ) : null}
      </Card>
    );
  }
}
