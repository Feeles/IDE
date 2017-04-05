import React, { PureComponent, PropTypes } from 'react';
import Card from './CardWindow';
import {CardActions} from 'material-ui/Card';
import {GridList, GridTile} from 'material-ui/GridList';
import FlatButton from 'material-ui/FlatButton';
import ImagePhotoCamera from 'material-ui/svg-icons/image/photo-camera';
import { emphasize, fade } from 'material-ui/utils/colorManipulator';
import transitions from 'material-ui/styles/transitions';

export default class ScreenShotCard extends PureComponent {

  static propTypes = {
    cardPropsBag: PropTypes.object.isRequired,
    files: PropTypes.array.isRequired,
    deleteFile: PropTypes.func.isRequired,
  };

  static contextTypes = {
    muiTheme: PropTypes.object.isRequired,
  };

  static icon() {
    return (
      <ImagePhotoCamera color="gray" />
    );
  }

  state = {
    images: this.getScreenShotImages(this.props.files),
    selected: null,
  };

  componentWillReceiveProps(nextProps) {
    if (this.props.files !== nextProps.files) {
      this.setState({images: this.getScreenShotImages(nextProps.files)});
    }
  }

  getScreenShotImages(files) {
    const path = 'screenshot/';
    return files.filter(item => item.name.indexOf(path) === 0 && item.is('image'));
  }

  handleSelect = (event, selected = null) => {
    event.stopPropagation();
    this.setState({selected});
  }

  render() {
    const {palette, paper} = this.context.muiTheme;
    const {selected} = this.state;

    const styles = {
      root: {
        backgroundColor: fade(emphasize(palette.canvasColor, 1), 0.07),
        maxHeight: '50vh',
        overflowX: 'hidden',
        overflowY: 'scroll',
        padding: 8,
      },
      tile(file) {
        const ab = (a, b) => file === selected ? a : b;
        return {
          boxShadow: ab(paper.zDepthShadows[1], 'none'),
          zIndex: ab(2, 1),
          transition: transitions.easeOut(),
        };
      },
    };

    return (
      <Card initiallyExpanded icon={ScreenShotCard.icon()} {...this.props.cardPropsBag}>
        <GridList
          cellHeight={180}
          style={styles.root}
          onTouchTap={(event) => this.handleSelect(event, null)}
        >
        {this.state.images.map((item, key) => (
          <GridTile
            key={key}
            title={item.name.replace(/^screenshot\//i, '')}
            style={styles.tile(item)}
            onTouchTap={(e) => this.handleSelect(e, item)}
          >
            <img src={item.blobURL} />
          </GridTile>
        ))}
        </GridList>
      </Card>
    );
  }
}
