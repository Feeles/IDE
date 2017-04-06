import React, { PureComponent, PropTypes } from 'react';
import Card from './CardWindow';
import {CardActions} from 'material-ui/Card';
import {GridList, GridTile} from 'material-ui/GridList';
import FlatButton from 'material-ui/FlatButton';
import ImagePhotoCamera from 'material-ui/svg-icons/image/photo-camera';
import { emphasize, fade } from 'material-ui/utils/colorManipulator';
import transitions from 'material-ui/styles/transitions';

import organization from '../organization';
import debugWindow from '../utils/debugWindow';
import {SourceFile} from '../File/';

export default class ScreenShotCard extends PureComponent {

  static propTypes = {
    cardPropsBag: PropTypes.object.isRequired,
    files: PropTypes.array.isRequired,
    findFile: PropTypes.func.isRequired,
    deployURL: PropTypes.string,
    oAuthId: PropTypes.string,
    getPassword: PropTypes.func.isRequired,
    clearPassword: PropTypes.func.isRequired,
    getConfig: PropTypes.func.isRequired,
    setConfig: PropTypes.func.isRequired,
    showNotice: PropTypes.func.isRequired,
  };

  static contextTypes = {
    muiTheme: PropTypes.object.isRequired,
  };

  static icon() {
    return (
      <ImagePhotoCamera color="gray" />
    );
  }

  static fileName = 'screenshot/cache.json';

  state = {
    images: this.getScreenShotImages(this.props.files),
    selected: null,
    cache: {},
  };

  get search() {
    try {
      const {pathname} = new URL(this.props.deployURL);
      return pathname.split('/').pop();
    } catch (e) {
      return null;
    }
  }

  async componentWillMount() {
    this.setState({
      cache: await this.getCache(),
    });
  }

  async componentWillReceiveProps(nextProps) {
    if (this.props.files !== nextProps.files) {
      this.setState({
        images: this.getScreenShotImages(nextProps.files),
        cache: await this.getCache(),
      });
    }
  }

  getScreenShotImages(files) {
    const path = 'screenshot/';
    return files.filter(item =>
      item.name.indexOf(path) === 0 &&
      item.is('image') &&
      !item.isTrashed
    );
  }

  async getCache() {
    const file = this.props.findFile(ScreenShotCard.fileName);
    try {
      return JSON.parse(file.text);
    } catch (e) {
      // same reference
      return this.state.cache;
    }
  }

  async setCache(hash, url) {
    const prevFile = this.props.findFile(ScreenShotCard.fileName);
    let next;
    try {
      next = JSON.parse(prevFile.text);
    } catch (e) {
      next = {...this.state.cache};
    }
    // update data
    next[hash] = url;
    const text = JSON.stringify(next);
    // update file
    if (prevFile) {
      // file is exist. replace it
      const nextFile = prevFile.set({text});
      await this.props.putFile(prevFile, nextFile);
    } else {
      // file is missing. insert it
      const nextFile = new SourceFile({
        type: 'application/json',
        name: ScreenShotCard.fileName,
        text,
      });
      await this.props.addFile(nextFile);
    }
    return next;
  }

  handleSelect = (event, selected = null) => {
    event.stopPropagation();
    this.setState({selected});
  };

  handleThumbnailSet = async () => {
    const {selected, cache} = this.state;
    const url = cache[selected.hash] || await this.uploadThumbnail(selected);
    const ogp = {
      ...this.props.getConfig('ogp'),
      'og:image': url,
      'twitter:image': url,
    };
    await this.props.setConfig('ogp', ogp);
    this.props.showNotice({
      message: 'Successfully set!',
    });
  };

  handleThumbnailDelete = async () => {
    const {selected, images} = this.state;
    if (!selected) return;
    // trashed file
    const nextFile = selected.set({
      options: {
        ...selected.options,
        isTrashed: true,
      }
    });
    await this.props.putFile(selected, nextFile);
    // move selected curosor
    const index = images.indexOf(selected);
    if (index === 0) {
      // next
      const next = images[1] || null;
      this.setState({selected: next});
    } else if (index > 0) {
      // previous
      const previous = images[index - 1] || null;
      this.setState({selected: previous});
    } else {
      // unselect
      this.setState({selected: null});
    }
  };

  async uploadThumbnail(file) {
    const body = new URLSearchParams();
    body.append('search', this.search);
    if (this.props.oAuthId) {
      // OAuth による認証
      body.append('oauth_id', this.props.oAuthId);
    } else if (organization.id) {
      // organization による認証
      body.append('organization_id', organization.id);
      // organization による認証にはパスワードが必要
      const password = this.props.getPassword();
      if (password) {
        body.append('organization_password', password);
      } else {
        // パスワード未入力
        throw new TypeError();
      }
    } else {
      // 認証していない
      throw new TypeError();
    }
    body.append('data_url', await file.toDataURL());

    const response = await fetch(organization.api.thumbnail, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      // [Safari Bug] URLSearchParams not supported in bodyInit
      body: body.toString(),
      mode: 'cors',
    });
    if (response.ok) {
      const url = await response.text();
      const cache = await this.setCache(file.hash, url);
      this.setState({cache});
      return url;
    } else {
      await this.props.clearPassword();
      await debugWindow(response);
    }
    throw new Error();
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
        <CardActions>
          <FlatButton primary
            label="Set to cover image"
            disabled={!selected || !this.props.deployURL}
            onTouchTap={this.handleThumbnailSet}
          />
          <FlatButton secondary
            label="delete"
            disabled={!selected}
            onTouchTap={this.handleThumbnailDelete}
          />
        </CardActions>
      </Card>
    );
  }
}
