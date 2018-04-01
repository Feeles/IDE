import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import Card from '../CardWindow';
import { CardMedia } from 'material-ui/Card';
import AvMusicVideo from 'material-ui/svg-icons/av/music-video';
import ReactPlayer from 'react-player';

const defaultPlayerState = {
  // https://github.com/CookPete/react-player#props
  width: 'initial',
  style: {
    maxWidth: 500
  },
  soundcloudConfig: {
    clientId: 'iFAPeKCVCOTKeA0nNJCHuVHif2gEBKbl',
    showArtwork: true
  }
};

export default class MediaCard extends PureComponent {
  static propTypes = {
    cardPropsBag: PropTypes.object.isRequired,
    updateCard: PropTypes.func.isRequired,
    globalEvent: PropTypes.object.isRequired
  };

  state = {
    playerState: {}
  };

  static icon() {
    return <AvMusicVideo />;
  }

  componentWillMount() {
    const { globalEvent } = this.props;
    globalEvent.on('message.media', this.handleMedia);
  }

  componentWillReceiveProps(nextProps) {
    const { visible } = this.props.cardPropsBag;
    if (visible && !nextProps.cardPropsBag.visible) {
      // カードが close されたとき動画を止める
      this.setState({
        playerState: {
          ...this.state.playerState,
          playing: false
        }
      });
    }
  }

  handleMedia = event => {
    const { value } = event.data;
    if (value) {
      // feeles.openMedia()
      this.setState({ playerState: value });
      this.props.updateCard('MediaCard', { visible: true });
    } else {
      // feeles.closeMedia()
      this.props.updateCard('MediaCard', { visible: false });
    }
  };

  render() {
    const playerState = {
      ...defaultPlayerState,
      ...this.state.playerState
    };

    return (
      <Card icon={MediaCard.icon()} {...this.props.cardPropsBag}>
        {this.state.playerState.url
          ? <ReactPlayer {...playerState} />
          : <div>URL not given</div>}
      </Card>
    );
  }
}
