import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import Paper from 'material-ui/Paper';
import IconButton from 'material-ui/IconButton';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import transitions from 'material-ui/styles/transitions';
import NavigationClose from 'material-ui/svg-icons/navigation/close';
import SocialShare from 'material-ui/svg-icons/social/share';

import organization from 'organization';

export default class Footer extends PureComponent {
  static propTypes = {
    deployURL: PropTypes.string,
    localization: PropTypes.object.isRequired,
    showNotice: PropTypes.func.isRequired
  };

  state = {
    open: true,
    rewrite: false
  };

  static contextTypes = {
    muiTheme: PropTypes.object.isRequired
  };

  get shareURL() {
    if (!this.props.deployURL) {
      return location.href;
    }
    const url = new URL(this.props.deployURL);
    const { origin, pathname } = url;
    return `${origin}/p/${pathname.split('/').reverse()[0]}`;
  }

  componentDidMount() {
    // 10 秒後に close する
    setTimeout(() => this.setState({ open: false }), 10000);

    if (process.env.NODE_ENV !== 'production') {
      return;
    }
    this.mountLineIt();
    this.mountTweetButton();
    this.mountFacebookShare();
  }

  componentWillReceiveProps(nextProps, nextState) {
    if (this.props.deployURL !== nextProps.deployURL) {
      // ボタンを再描画させるため、一度中の要素をすべて消してしまう
      // state.rewrite はすぐに false になる
      this.setState({ rewrite: true });
    }
  }

  componentDidUpdate() {
    if (this.state.rewrite) {
      this.setState({ rewrite: false });
    } else {
      // Rewrite
      this.mountLineIt();
      this.mountTweetButton();
      this.mountFacebookShare();
    }
  }

  handleLinkCopy = event => {
    event.target.select();
    if (document.execCommand('copy')) {
      const message = this.props.localization.menu.linkCopied + this.shareURL;
      this.props.showNotice({ message });
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
    js.src =
      'https://d.line-scdn.net/r/web/social-plugin/js/thirdparty/loader.min.js';
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
      var js,
        fjs = d.getElementsByTagName(s)[0],
        t = window.twttr || {};
      if (d.getElementById(id)) return t;
      js = d.createElement(s);
      js.id = id;
      js.src = 'https://platform.twitter.com/widgets.js';
      fjs.parentNode.insertBefore(js, fjs);

      t._e = [];
      t.ready = function(f) {
        t._e.push(f);
      };

      return t;
    })(document, 'script', 'twitter-wjs');
  }

  mountFacebookShare() {
    const { localization } = this.props;
    if (window.FB) {
      FB.XFBML.parse();
    }
    /* https://developers.facebook.com/docs/plugins/share-button */
    (function(d, s, id) {
      var js,
        fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) return;
      js = d.createElement(s);
      js.id = id;
      js.src = `//connect.facebook.net/${localization.ll_CC}/sdk.js#xfbml=1&version=v2.8`;
      fjs.parentNode.insertBefore(js, fjs);
    })(document, 'script', 'facebook-jssdk');
  }

  render() {
    if (this.state.rewrite) {
      return null;
    }
    const { transitions } = this.context.muiTheme;

    const styles = {
      root: {
        flex: 0,
        display: this.state.open ? 'flex' : 'none',
        height: '2.5rem',
        justifyContent: 'space-around',
        alignItems: 'center',
        zIndex: 1
      },
      opener: {
        position: 'fixed',
        left: 8,
        bottom: 8,
        transform: `translateY(${this.state.open ? 48 : 0}px)`,
        zIndex: 1,
        transition: transitions.easeOut(null, 'transform')
      },
      blank: {
        flex: '0 0 1rem'
      }
    };

    const [lang] = this.props.localization.accept || ['en'];

    const params = new URLSearchParams();
    params.set('url', this.shareURL);
    if (organization.hashtags) {
      params.set('hashtags', organization.hashtags);
    }
    const twitterIntent = `https://twitter.com/intent/tweet?${params}`;

    return (
      /* z-index: inherit; の階層を Main 直下に置くことで フルスクリーンのとき奥に行くように */
      <div>
        <FloatingActionButton
          mini
          secondary
          style={styles.opener}
          onTouchTap={() => this.setState({ open: true })}
        >
          <SocialShare />
        </FloatingActionButton>
        <Paper style={styles.root}>
          <div style={{ flex: 1 }} />
          <input
            readOnly
            value={this.shareURL}
            onTouchTap={this.handleLinkCopy}
          />
          <div style={styles.blank} />
          {/* Twitter */}
          <a
            className="twitter-share-button"
            href={twitterIntent}
            data-lang={lang}
            data-show-count="false"
          />
          <div style={styles.blank} />
          {/* LINE */}
          <div
            className="line-it-button"
            data-url={this.shareURL}
            data-lang={lang}
            data-type="share-a"
          />
          <div style={styles.blank} />
          {/* Facebook */}
          <div style={{ marginTop: -4 }}>
            <div
              className="fb-share-button"
              data-href={this.shareURL}
              data-layout="button"
            />
          </div>
          <div style={styles.blank} />
          <IconButton onTouchTap={() => this.setState({ open: false })}>
            <NavigationClose />
          </IconButton>
        </Paper>
      </div>
    );
  }
}
