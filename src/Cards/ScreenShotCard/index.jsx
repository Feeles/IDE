import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import md5 from 'md5';
import Card from '../CardWindow';
import { CardActions } from 'material-ui/Card';
import { GridList, GridTile } from 'material-ui/GridList';
import FlatButton from 'material-ui/FlatButton';
import ImagePhotoCamera from 'material-ui/svg-icons/image/photo-camera';
import ActionDelete from 'material-ui/svg-icons/action/delete';
import { emphasize, fade } from 'material-ui/utils/colorManipulator';

import organization from 'organization';
import debugWindow from 'utils/debugWindow';
import { SourceFile, BinaryFile } from 'File/';

export default class ScreenShotCard extends PureComponent {
  static propTypes = {
    cardPropsBag: PropTypes.object.isRequired,
    files: PropTypes.array.isRequired,
    findFile: PropTypes.func.isRequired,
    getConfig: PropTypes.func.isRequired,
    setConfig: PropTypes.func.isRequired,
    showNotice: PropTypes.func.isRequired,
    addFile: PropTypes.func.isRequired,
    putFile: PropTypes.func.isRequired,
    updateCard: PropTypes.func.isRequired,
    globalEvent: PropTypes.object.isRequired
  };

  static contextTypes = {
    muiTheme: PropTypes.object.isRequired
  };

  static icon() {
    return <ImagePhotoCamera />;
  }

  static fileName = 'feeles/capture.json';

  state = {
    cache: {},
    selected: null,
    uploading: null
  };

  get search() {
    try {
      const { pathname } = new URL(this.props.deployURL);
      return pathname.split('/').pop();
    } catch (e) {
      return null;
    }
  }

  async componentWillMount() {
    const { globalEvent } = this.props;
    globalEvent.on('message.capture', this.handleCapture);

    this.setState({
      cache: await this.getCache()
    });
  }

  async componentWillReceiveProps(nextProps) {
    if (this.props.files !== nextProps.files) {
      this.setState({
        cache: await this.getCache()
      });
    }
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
      next = { ...this.state.cache };
    }
    // update data
    next[hash] = url;
    const text = JSON.stringify(next);
    // update file
    if (prevFile) {
      // file is exist. replace it
      const nextFile = prevFile.set({ text });
      await this.props.putFile(prevFile, nextFile);
    } else {
      // file is missing. insert it
      const nextFile = new SourceFile({
        type: 'application/json',
        name: ScreenShotCard.fileName,
        text
      });
      await this.props.addFile(nextFile);
    }
    return next;
  }

  handleSelect = (event, selected = null) => {
    event.stopPropagation();
    if (this.state.selected === selected) {
      selected = null; // toggle
    }
    this.setState({ selected });
  };

  // 'capture' message をうけとったとき
  handleCapture = async event => {
    const { value } = event.data;
    const uploading = md5(value);

    // キャッシュを確認
    if (uploading in this.state.cache) {
      await this.props.updateCard('ScreenShotCard', { visible: true });
      this.props.cardPropsBag.scrollToCard('ScreenShotCard');
      this.setState({ selected: uploading });
      return;
    }

    // アップロードの前に仮の URL を挿入
    const cache = {
      ...this.state.cache,
      // 一時的に Data URL を挿入 (あとで置き換わる)
      [uploading]: [value]
    };
    this.setState({ cache, uploading }, async () => {
      await this.props.updateCard('ScreenShotCard', { visible: true });
      this.props.cardPropsBag.scrollToCard('ScreenShotCard');
    });
    // サムネイルをアップロード
    const url = await this.uploadThumbnail(value);
    await this.setCache(uploading, url);
    this.setState({ uploading: null });
    // サムネイルをセット
    this.setState({ selected: uploading }, this.handleThumbnailSet);
  };

  handleThumbnailSet = async () => {
    const { selected, uploading, cache } = this.state;
    if (selected === uploading) return;
    const url = cache[selected];
    const ogp = {
      ...this.props.getConfig('ogp'),
      'og:image': url,
      'twitter:image': url
    };
    await this.props.setConfig('ogp', ogp);
    this.props.showNotice({
      message: this.props.localization.screenShotCard.set
    });
  };

  handleThumbnailDelete = async () => {
    const { selected, cache } = this.state;
    // 選択アイテムを削除
    await this.setCache(selected, undefined);
    // 選択アイテムをとなりに移動
    const keys = Object.keys(this.state.cache);
    const index = keys.indexOf(selected);
    const next = keys[index + 1] || keys[index - 1] || null;
    this.setState({ selected: next });
  };

  async uploadThumbnail(data_url) {
    const body = new URLSearchParams();
    body.append('data_url', data_url);
    const response = await fetch(organization.api.thumbnail, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: body.toString(),
      mode: 'cors'
    });
    if (response.ok) {
      return await response.text();
    } else {
      await debugWindow(response);
    }
    throw new Error();
  }

  render() {
    const { palette, paper, transitions } = this.context.muiTheme;
    const { selected, uploading } = this.state;
    const { localization } = this.props;

    const styles = {
      root: {
        backgroundColor: fade(emphasize(palette.canvasColor, 1), 0.07),
        maxHeight: '50vh',
        overflowX: 'hidden',
        overflowY: 'scroll',
        padding: 8
      },
      action: {
        display: 'flex'
      },
      blank: {
        flex: '1 1 auto'
      },
      tile(hash) {
        return {
          zIndex: hash === selected ? 2 : 1,
          filter: hash === uploading ? 'blur(1px)' : 'blur(0px)',
          opacity: hash === uploading ? 0.5 : 1,
          overflow: hash === selected ? 'visible' : 'hidden',
          transition: transitions.easeOut()
        };
      },
      image(file) {
        return {
          boxShadow: file === selected ? paper.zDepthShadows[1] : 'none',
          transition: transitions.easeOut()
        };
      }
    };

    const gridList = [];
    for (const [hash, url] of Object.entries(this.state.cache)) {
      gridList.push(
        <GridTile
          key={hash}
          style={styles.tile(hash)}
          onTouchTap={e => this.handleSelect(e, hash)}
        >
          <img style={styles.image(hash)} src={url} />
        </GridTile>
      );
    }

    const alreadySetImage =
      this.props.getConfig('ogp')['og:image'] === this.state.cache[selected];

    return (
      <Card icon={ScreenShotCard.icon()} {...this.props.cardPropsBag}>
        <GridList
          cellHeight={180}
          style={styles.root}
          onTouchTap={event => this.handleSelect(event, null)}
        >
          {gridList}
        </GridList>
        <CardActions style={styles.action}>
          <FlatButton
            label={localization.screenShotCard.coverImage}
            disabled={!selected || alreadySetImage}
            onTouchTap={this.handleThumbnailSet}
          />
          <div style={styles.blank} />
          <FlatButton
            label=""
            icon={<ActionDelete />}
            disabled={!selected}
            onTouchTap={this.handleThumbnailDelete}
          />
        </CardActions>
      </Card>
    );
  }
}
