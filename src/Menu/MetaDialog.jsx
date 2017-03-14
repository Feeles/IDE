import React, { PureComponent, PropTypes } from 'react';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import {Card, CardMedia, CardHeader, CardActions} from 'material-ui/Card';
import CircularProgress from 'material-ui/CircularProgress';
import IconButton from 'material-ui/IconButton';
import NavigationArrowForward from 'material-ui/svg-icons/navigation/arrow-forward';
import NavigationArrowBack from 'material-ui/svg-icons/navigation/arrow-back';
import transitions from 'material-ui/styles/transitions';

import organization from '../organization';

/**
 * OGPの設定を行い, デプロイが必要な場合 true で resolve する
 * 途中でキャンセルされた場合は false で resolve する
 */
export default class MetaDialog extends PureComponent {

  static propTypes = {
    onRequestClose: PropTypes.func.isRequired,
    localization: PropTypes.object.isRequired,
    getConfig: PropTypes.func.isRequired,
    setConfig: PropTypes.func.isRequired,
  };

  state = {
    stepIndex: 0,
  };

  componentDidUpdate(prevProps, prevState) {
    const {stepIndex, isDeploying} = this.state;
    if (prevState.stepIndex !== stepIndex && stepIndex === 2) {
      // Close this dialog and start uploading
      this.props.onRequestClose(true);
    }
  }

  next = () => {
    this.setState(prevState => ({
      stepIndex: prevState.stepIndex + 1,
    }));
  };

  back = () => {
    if (this.state.stepIndex === 0) {
      this.props.onRequestClose(false);
      return;
    }
    this.setState(prevState => ({
      stepIndex: prevState.stepIndex - 1,
    }));
  };

  renderStep() {
    const bag = {
      getConfig: this.props.getConfig,
      setConfig: this.props.setConfig,
      localization: this.props.localization,
    };
    switch (this.state.stepIndex) {
      case 0: return <EditOGP {...bag} />;
      case 1: return <EditAuthor {...bag} />;
    }
  }

  render() {
    const {stepIndex} = this.state;
    const {localization} = this.props;

    const actions = [
      <FlatButton key="1" label={localization.metaDialog.back} onTouchTap={this.back} />,
      <RaisedButton key="2" primary label={localization.metaDialog.next} onTouchTap={this.next} />,
    ];

    const styles = {
      dialog: {
        minHeight: 500,
        overflowX: 'auto',
        overflowY: 'scroll',
      },
    };

    return (
      <Dialog open
        actions={actions}
        bodyStyle={styles.dialog}
        onRequestClose={() => this.props.onRequestClose(false)}
      >
        {this.renderStep()}
      </Dialog>
    );
  }
}

class EditOGP extends PureComponent {

  static propTypes = {
    getConfig: PropTypes.func.isRequired,
    setConfig: PropTypes.func.isRequired,
  };

  static contextTypes = {
    muiTheme: PropTypes.object.isRequired,
  };

  state = {
    isLoading: false,
  };

  componentWillMount() {
    const ogp = this.props.getConfig('ogp');
    if (!ogp['og:image'] && organization.placeholder['og:image']) {
      this.handleChangeImage(organization.placeholder['og:image']);
    }
  }

  handleChangeTitle = async (event, text) => {
    await this.props.setConfig('ogp', {
      ...this.props.getConfig('ogp'),
      'og:title': text,
      'twitter:title': text || '...',
    });
    this.forceUpdate();
  };

  handleChangeDescription = async (event, text) => {
    await this.props.setConfig('ogp', {
      ...this.props.getConfig('ogp'),
      'og:description': text,
      'twitter:description': text || '...',
    });
    this.forceUpdate();
  };

  handleChangeImage = async (src) => {
    this.setState({isLoading: true});

    const image = await new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = src;
    });

    await this.props.setConfig('ogp', {
      ...this.props.getConfig('ogp'),
      'og:image': image.src,
      'og:image:width': image.width,
      'og:image:height': image.height,
      'twitter:card': 'summary_large_image',
      'twitter:image': image.src
    });

    this.setState({isLoading: false});
  };

  handleNext = () => {
    const ogp = this.props.getConfig('ogp');
    const cursor = organization.images.indexOf(ogp['og:image']);
    const {length} = organization.images;
    const src = organization.images[(cursor + 1) %  length]
    this.handleChangeImage(src);
  };

  handlePrevious = () => {
    const ogp = this.props.getConfig('ogp');
    const cursor = organization.images.indexOf(ogp['og:image']);
    const {length} = organization.images;
    const src = organization.images[(cursor - 1 + length * 2) % length]
    this.handleChangeImage(src);
  };

  render() {
    const {localization} = this.props;
    const ogp = this.props.getConfig('ogp');

    const styles = {
      card: {
        marginTop: 14,
        width: 460,
        marginLeft: 'auto',
        marginRight: 'auto',
        overflow: 'hidden',
      },
      media: {
        backgroundImage: `url(${ogp['og:image'] || ''})`,
        backgroundSize: 'cover',
        opacity: this.state.isLoading ? 0.5 : 1,
        transition: transitions.easeOut(),
      },
      image: {
        opacity: 0,
      },
      header: {
        width: '100%',
      },
      innerHeader: {
        paddingTop: 8,
        paddingBottom: 0,
      },
      textField: {
        marginTop: -16,
      },
      description: {
        fontSize: 14,
      },
      loading: {
        width: '100%',
        paddingTop: '50%',
        textAlign: 'center',
        height: 0,
      },
      progress: {
        top: -150,
      },
      navigation: {
        display: 'flex',
      },
    }

    return (
      <div>
        <Card style={styles.card}>
          <CardMedia
            style={styles.media}
            overlay={organization.images.length > 0 ? (
              <CardActions style={styles.navigation}>
                <IconButton onTouchTap={this.handlePrevious}>
                  <NavigationArrowBack color="white" />
                </IconButton>
                <div style={{flexGrow: 1}}></div>
                <IconButton onTouchTap={this.handleNext}>
                  <NavigationArrowForward color="white" />
                </IconButton>
              </CardActions>
            ) : null}
          >
          {ogp['og:image']
            ? <img style={styles.image} src={ogp['og:image']} />
            : <div style={styles.loading}><CircularProgress style={styles.progress} size={100} /></div>
          }
          </CardMedia>
          <CardHeader
            title={
              <TextField id="" fullWidth
                floatingLabelText={localization.metaDialog.title}
                hintText={organization.placeholder['og:title']}
                defaultValue={ogp['og:title']}
                style={styles.textField}
                onChange={this.handleChangeTitle}
              />
            }
            subtitle={
              <TextField id="" fullWidth multiLine rows={2}
                floatingLabelText={localization.metaDialog.description}
                hintText={organization.placeholder['og:description']}
                defaultValue={ogp['og:description']}
                hintStyle={styles.description}
                style={styles.textField}
                onChange={this.handleChangeDescription}
              />
            }
            style={styles.innerHeader}
            textStyle={styles.header}
          />
        </Card>
      </div>
    );
  }
}

class EditAuthor extends PureComponent {

  static propTypes = {
    getConfig: PropTypes.func.isRequired,
    setConfig: PropTypes.func.isRequired,
    localization: PropTypes.object.isRequired,
  };

  handleChangeNickname = (event, text) => {
    this.props.setConfig('ogp', {
      ...this.props.getConfig('ogp'),
      'og:author': text,
    });
  };

  handleChangeTwitterId = (event, text) => {
    this.props.setConfig('ogp', {
      ...this.props.getConfig('ogp'),
      'twitter:author': text,
    });
  };

  render() {
    const {localization} = this.props;
    const ogp = this.props.getConfig('ogp');

    return (
      <div>
        <h1>{localization.metaDialog.creator}</h1>
        <h4>{localization.metaDialog.creatorConfirm}</h4>
        <TextField id="" fullWidth
          floatingLabelText={localization.metaDialog.nickname}
          hintText={organization.placeholder['og:author']}
          defaultValue={ogp['og:author']}
          onChange={this.handleChangeNickname}
        />
        <TextField id="" fullWidth
          floatingLabelText={localization.metaDialog.twitterId}
          hintText={organization.placeholder['twitter:author']}
          defaultValue={ogp['twitter:author']}
          onChange={this.handleChangeTwitterId}
        />
      </div>
    );
  }
}
