import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { style } from 'typestyle';
import Card from '@material-ui/core/Card';
import CardWindow from '../CardWindow';
import uniq from 'lodash/uniq';

import ShotPane from './ShotPane';
import Snippet from '../../File/Snippet';

const scrapbox = {
  url: title => `https://scrapbox.io/hackforplay/${encodeURIComponent(title)}`,
  page: title =>
    `https://scrapbox.io/api/pages/hackforplay/${encodeURIComponent(title)}`,
  icon: title =>
    `https://scrapbox.io/api/pages/hackforplay/${encodeURIComponent(
      title
    )}/icon`
};

const cn = {
  hintFlexbox: style({
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '1em 0'
  }),
  hintHeading: style({
    fontSize: '1.5em',
    fontWeight: 600,
    marginRight: '1em'
  }),
  cardLink: style({
    textDecoration: 'none'
  }),
  cardFlexbox: style({
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'stretch',
    overflow: 'hidden'
  }),
  card: style({
    width: '10em',
    height: '10em',
    marginRight: '1em',
    wordBreak: 'break-all',
    padding: '1em'
  }),
  cardTitle: style({
    margin: 0,
    overflow: 'hidden',
    display: '-webkit-box',
    WebkitLineClamp: 3,
    WebkitBoxOrient: 'vertical',
    textOverflow: 'ellipsis'
  }),
  cardIcon: style({
    width: '100%'
  })
};

export default class ShotCard extends PureComponent {
  static propTypes = {
    cardPropsBag: PropTypes.object.isRequired,
    fileView: PropTypes.object.isRequired,
    setCardVisibility: PropTypes.func.isRequired,
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

  componentDidMount() {
    const { globalEvent } = this.props;
    globalEvent.on('message.code', this.handleCode);
    globalEvent.on('message.complete', this.handleComplete);
  }

  handleCode = event => {
    const { value } = event.data;
    if (value) {
      // feeles.openCode()
      const file = this.props.findFile(value);
      this.setState({
        file,
        completes: this.props.getConfig('snippets')(file)
      });
      this.props.setCardVisibility('ShotCard', true);
    } else {
      // feeles.closeCode()
      this.props.setCardVisibility('ShotCard', false);
    }
  };

  handleComplete = event => {
    const { value } = event.data;
    if (!Array.isArray(value)) return;

    const snippets = value.map(
      item =>
        new Snippet({
          name: '',
          fileKey: '',
          ...(item || {})
        })
    );

    const completes = this.state.file
      ? this.props
          .getConfig('snippets')()
          .concat(snippets)
      : snippets;
    this.setState({
      completes
    });
  };

  handleSetLinkObjects = (linkObjects = []) => {
    const titles = linkObjects.map(obj => obj.linkText);
    this.setState({
      footer: this.renderFooter(uniq(titles))
    });
  };

  renderFooter(titles) {
    return titles.length > 0 ? (
      <div>
        <div className={cn.hintFlexbox}>
          <div className={cn.hintHeading}>💡 ヒント</div>
          <div>
            <a href="http://scrapbox.io">Scrapbox</a> にとびます
            (実験段階の機能)
          </div>
        </div>
        <div className={cn.cardFlexbox}>
          {titles
            .map(title => (
              <a
                key={title}
                href={scrapbox.url(title)}
                rel="noopener noreferrer"
                target="_blank"
                className={cn.cardLink}
              >
                <Card className={cn.card}>
                  <div className={cn.cardTitle}>{title}</div>
                  <img
                    src={scrapbox.icon(title)}
                    alt={`ページが存在しないか、アイコンが設定されていません`}
                    className={cn.cardIcon}
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
      <CardWindow {...this.props.cardPropsBag} footer={this.state.footer}>
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
