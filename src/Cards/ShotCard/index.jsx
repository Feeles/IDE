import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import Card from 'material-ui/Card';
import CardWindow from '../CardWindow';
import ContentReply from 'material-ui/svg-icons/content/reply';
import uniq from 'lodash/uniq';

import ShotPane from './ShotPane';
import shallowEqual from '../../utils/shallowEqual';

const scrapbox = {
  url: title => `https://scrapbox.io/hackforplay/${encodeURIComponent(title)}`,
  page: title =>
    `https://scrapbox.io/api/pages/hackforplay/${encodeURIComponent(title)}`,
  icon: title =>
    `https://scrapbox.io/api/pages/hackforplay/${encodeURIComponent(
      title
    )}/icon`
};

const getStyle = () => {
  return {
    hintFlexbox: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '1em 0'
    },
    hintHeading: {
      fontSize: '1.5em',
      fontWeight: 600,
      marginRight: '1em'
    },
    cardLink: {
      textDecoration: 'none'
    },
    cardFlexbox: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'stretch',
      overflow: 'hidden'
    },
    card: {
      width: '10em',
      height: '10em',
      marginRight: '1em',
      wordBreak: 'break-all',
      padding: '1em'
    },
    cardTitle: {
      margin: 0,
      overflow: 'hidden',
      display: '-webkit-box',
      WebkitLineClamp: 3,
      WebkitBoxOrient: 'vertical',
      textOverflow: 'ellipsis'
    },
    cardIcon: {
      width: '100%'
    }
  };
};

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
    const titles = linkObjects.map(obj => obj.linkText);
    this.setState({
      footer: this.renderFooter(uniq(titles))
    });
  };

  renderFooter(titles) {
    const styles = getStyle();
    return titles.length > 0 ? (
      <div>
        <div style={styles.hintFlexbox}>
          <div style={styles.hintHeading}>💡 ヒント</div>
          <div>
            <a href="http://scrapbox.io">Scrapbox</a> にとびます
            (実験段階の機能)
          </div>
        </div>
        <div style={styles.cardFlexbox}>
          {titles
            .map(title => (
              <a
                key={title}
                href={scrapbox.url(title)}
                rel="noopener noreferrer"
                target="_blank"
                style={styles.cardLink}
              >
                <Card style={styles.card}>
                  <div style={styles.cardTitle}>{title}</div>
                  <img
                    src={scrapbox.icon(title)}
                    alt={`ページが存在しないか、アイコンが設定されていません`}
                    style={styles.cardIcon}
                  />
                </Card>
              </a>
            ))
            .concat(<div key="$lastcard" />)}
        </div>
      </div>
    ) : null;
  }

  render() {
    const { visible } = this.props.cardPropsBag;

    return (
      <CardWindow
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
      </CardWindow>
    );
  }
}
