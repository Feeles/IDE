import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import Card from '../CardWindow';
import { CardMedia } from 'material-ui/Card';
import AvMusicVideo from 'material-ui/svg-icons/av/music-video';
import ReactPlayer from 'react-player';

export default class MediaCard extends PureComponent {
  static propTypes = {
    cardPropsBag: PropTypes.object.isRequired,
    port: PropTypes.object,
    updateCard: PropTypes.func.isRequired
  };

  state = {
    playerState: {
      // https://github.com/CookPete/react-player#props
    }
  };

  static icon() {
    return <AvMusicVideo />;
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.port !== nextProps.port) {
      if (this.props.port) {
        this.props.port.removeEventListener('message', this.handleMessage);
      }
      if (nextProps.port) {
        nextProps.port.addEventListener('message', this.handleMessage);
      }
    }
  }

  handleMessage = event => {
    if (!event.data || !event.data.query) return;
    const { query, value } = event.data;

    if (query === 'media' && value) {
      // feeles.openMedia()
      this.setState({ playerState: value });
      this.props.updateCard('MediaCard', { visible: true });
    } else if (query === 'media') {
      // feeles.closeMedia()
      this.props.updateCard('MediaCard', { visible: false });
    }
  };

  render() {
    const playerState = {
      width: 'initial',
      style: {
        maxWidth: 500
      },
      ...this.state.playerState
    };

    return (
      <Card icon={MediaCard.icon()} {...this.props.cardPropsBag}>
        {this.state.playerState.url
          ? <ReactPlayer {...playerState} />
          : <div>
              URL not given
            </div>}
      </Card>
    );
  }
}
