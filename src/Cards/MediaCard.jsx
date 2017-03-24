import React, {Component, PropTypes} from 'react';
import Card from './CardWindow';
import {CardMedia} from 'material-ui/Card';
import AvMusicVideo from 'material-ui/svg-icons/av/music-video';
import ReactPlayer from 'react-player';

export default class MediaCard extends Component {

  static propTypes = {
    port: PropTypes.object,
    updateCard: PropTypes.func.isRequired,
  };

  state = {
    playerState: {
      // https://github.com/CookPete/react-player#props
    }
  };

  static icon() {
    return (
      <AvMusicVideo color="gray" />
    );
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

  handleMessage = (event) => {
    if (!event.data || !event.data.query)
      return;
    const {query, value} = event.data;

    if (query === 'media' && value) {
      // feeles.openMedia()
      this.setState({playerState: value});
      this.props.updateCard('MediaCard', {visible: true});
    } else if (query === 'media') {
      // feeles.closeMedia()
      this.props.updateCard('MediaCard', {visible: false});
    }
  };

  render() {
    return (
      <Card initiallyExpanded icon={MediaCard.icon()} {...this.props.cardPropsBag}>
      {this.state.playerState.url ? (
        <CardMedia>
          <ReactPlayer {...this.state.playerState}/>
        </CardMedia>
      ) : (
        <div>
          URL not given
        </div>
      )}
      </Card>
    );
  }
}
