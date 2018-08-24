import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import Card from '../CardWindow';
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

  componentDidMount() {
    const { globalEvent } = this.props;
    globalEvent.on('message.media', this.handleMedia);
  }

  componentDidUpdate(prevProps) {
    const { visible } = prevProps.cardPropsBag;
    if (visible && !this.props.cardPropsBag.visible) {
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
      <Card
        icon={this.props.localization.mediaCard.title}
        {...this.props.cardPropsBag}
      >
        {this.state.playerState.url ? (
          <ReactPlayer {...playerState} />
        ) : (
          <div>URL not given</div>
        )}
      </Card>
    );
  }
}
