import React, {Component, PropTypes} from 'react';
import Card from './CardWindow';
import {CardMedia} from 'material-ui/Card';
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

    // Media
    if (query === 'media') {
      this.setState({playerState: value});
      this.props.updateCard('MediaCard', {visible: true});
    }
  };

  render() {
    return (
      <Card initiallyExpanded {...this.props.cardPropsBag}>
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
