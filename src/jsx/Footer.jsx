import React, {PureComponent, PropTypes} from 'react';
import Paper from 'material-ui/Paper';

import organization from '../organization';

export default class Footer extends PureComponent {

  static propTypes = {
    deployURL: PropTypes.string,
    localization: PropTypes.object.isRequired,
    showNotice: PropTypes.func.isRequired,
  };

  state = {
    open: true,
    rewrite: false,
  };

  get shareURL() {
    if (!this.props.deployURL) {
      return location.href;
    }
    const url = new URL(this.props.deployURL);
    const {origin, pathname} = url;
    return `${origin}/p/${pathname.split('/').reverse()[0]}`;
  }

  componentDidMount() {
    this.mountLineIt();
    this.mountTweetButton();
  }

  componentWillReceiveProps(nextProps, nextState) {
    if (this.props.deployURL !== nextProps.deployURL) {
      // ボタンを再描画させるため、一度中の要素をすべて消してしまう
      // state.rewrite はすぐに false になる
      this.setState({rewrite: true});
    }
  }

  componentDidUpdate() {
    if (this.state.rewrite) {
      this.setState({rewrite: false});
    } else {
      // Rewrite
      this.mountLineIt();
      this.mountTweetButton();
    }
  }

  handleLinkCopy = (event) => {
    event.target.select();
    if (document.execCommand('copy')) {
      const message = this.props.localization.menu.linkCopied + this.shareURL;
      this.props.showNotice({message});
    }
  };

  mountLineIt() {
    const id = 'line-wjs';
    if (document.querySelector(id)) {
      if (window.LineIt) {
        LineIt.loadButton();
      }
      return;
    }
    const js = document.createElement('script');
    js.id = id;
    js.src = 'https://d.line-scdn.net/r/web/social-plugin/js/thirdparty/loader.min.js';
    js.onload = () => {
      LineIt.loadButton();
    };
    const fjs = document.getElementsByTagName('script')[0];
    fjs.parentNode.insertBefore(js, fjs);
  }


  mountTweetButton() {
    if (window.twttr) {
      twttr.widgets.load();
    }
    /* https://dev.twitter.com/web/javascript/loading */
    window.twttr = (function(d, s, id) {
      var js, fjs = d.getElementsByTagName(s)[0],
      t = window.twttr || {};
      if (d.getElementById(id)) return t;
      js = d.createElement(s);
      js.id = id;
      js.src = "https://platform.twitter.com/widgets.js";
      fjs.parentNode.insertBefore(js, fjs);

      t._e = [];
      t.ready = function(f) {
        t._e.push(f);
      };

      return t;
    }(document, "script", "twitter-wjs"));
  }

  render() {
    if (this.state.rewrite) {
      return null;
    }

    const styles = {
      root: {
        flex: '0 0 2rem',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        zIndex: 1,
      },
      blank: {
        flex: '0 0 1rem',
      },
    };

    const [lang] = this.props.localization.accept || ['en'];

    const params = new URLSearchParams();
    params.set('url', this.shareURL);
    if (organization.hashtags) {
      params.set('hashtags', organization.hashtags);
    }
    const twitterIntent = `https://twitter.com/intent/tweet?${params}`;

    return (
      <Paper style={styles.root}>
        <div style={{flex: '1 1 auto'}}></div>
        <input readOnly
          value={this.shareURL}
          onTouchTap={this.handleLinkCopy}
        />
        <div style={styles.blank}></div>
        {/* Twitter */}
        <a
          className="twitter-share-button"
          href={twitterIntent}
          data-lang={lang}
          data-show-count="false"
          style={styles.button}
        ></a>
        <div style={styles.blank}></div>
        {/* LINE */}
        <div
          className="line-it-button"
          data-url={this.shareURL}
          data-lang={lang}
          data-type="share-a"
          style={styles.button}
        ></div>
        <div style={styles.blank}></div>
      </Paper>
    );
  }
}
