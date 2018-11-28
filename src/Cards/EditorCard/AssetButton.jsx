import React, { PureComponent } from 'react';
import { withTheme } from '@material-ui/core/styles';
import { fade } from '@material-ui/core/styles/colorManipulator';
import PropTypes from 'prop-types';
import { style, classes } from 'typestyle';
import { url } from 'csx';
import Popover from '@material-ui/core/Popover';
import Button from '@material-ui/core/Button';
import ButtonBase from '@material-ui/core/ButtonBase';
import Typography from '@material-ui/core/Typography';
import Add from '@material-ui/icons/Add';
import OpenInNew from '@material-ui/icons/OpenInNew';
import Description from '@material-ui/icons/Description';

const protocols = ['https:', 'http:', 'data:', 'file:', 'blob:'];

const cn = {
  mainButton: style({
    width: 80,
    height: 80,
    backgroundSize: 'contain',
    backgroundPosition: '50% 50%',
    backgroundRepeat: 'no-repeat'
  }),
  actions: style({
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: 2
  }),
  iconButton: style({
    flex: 1,
    minWidth: 36
  }),
  popoverClasses: {
    paper: style({
      padding: 8,
      maxWidth: 500
    })
  },
  label: style({
    position: 'absolute',
    bottom: 0,
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    fontSize: 10,
    fontWeight: 600
  }),
  blank: style({
    display: 'inline-flex',
    width: 8
  })
};
const getCn = ({ theme }) => ({
  root: style({
    position: 'relative',
    margin: '8px 30px 0px 8px'
  }),
  button: style({
    color: theme.palette.getContrastText(theme.palette.text.primary),
    transition: theme.transitions.create('background-color'),
    backgroundColor: fade(theme.palette.grey[600], 0.6),
    $nest: {
      '&:hover': {
        backgroundColor: theme.palette.grey[600]
      },
      '&:disabled': {
        color: theme.palette.text.disabled
      }
    }
  })
});

@withTheme()
export default class AssetButton extends PureComponent {
  static propTypes = {
    theme: PropTypes.object.isRequired,
    code: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    descriptionMoreURL: PropTypes.string,
    label: PropTypes.string,
    image: PropTypes.string,
    filePath: PropTypes.string,
    insertAsset: PropTypes.func.isRequired,
    openFile: PropTypes.func.isRequired,
    findFile: PropTypes.func.isRequired,
    localization: PropTypes.object.isRequired,
    globalEvent: PropTypes.object.isRequired
  };

  static defaultProps = {
    description: ''
  };

  state = {
    anchorEl: null,
    backgroundStyle: {}
  };

  handleOpen = event => {
    this.setState({ anchorEl: event.currentTarget });
  };

  handleClose = () => {
    this.setState({ anchorEl: null });
  };

  updateImage() {
    let backgroundImage = '';

    if (this.props.image) {
      if (protocols.some(p => this.props.image.indexOf(p) === 0)) {
        backgroundImage = url(this.props.image);
      } else {
        const file = this.props.findFile(this.props.image);
        if (file) {
          backgroundImage = url(file.blobURL);
        }
      }
    }
    if (backgroundImage !== this.state.backgroundStyle.backgroundImage) {
      this.setState({
        backgroundStyle: { backgroundImage }
      });
    }
  }

  componentDidMount() {
    this.updateImage();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.image !== this.props.image) {
      this.updateImage();
    }
  }

  render() {
    const dcn = getCn(this.props);
    const { localization } = this.props;

    const disableOpenFile = !this.props.filePath;

    return (
      <>
        <div className={dcn.root}>
          <ButtonBase
            focusRipple
            className={classes(dcn.button, cn.mainButton)}
            style={this.state.backgroundStyle}
            onClick={this.handleOpen}
          >
            <span className={cn.label}>{this.props.label}</span>
          </ButtonBase>
          <div className={cn.actions}>
            <ButtonBase
              focusRipple
              className={classes(dcn.button, cn.iconButton)}
              onClick={this.props.insertAsset}
            >
              <Add />
            </ButtonBase>
            <ButtonBase
              focusRipple
              disabled={disableOpenFile}
              className={classes(dcn.button, cn.iconButton)}
              onClick={this.props.openFile}
            >
              <Description />
            </ButtonBase>
          </div>
        </div>
        <Popover
          open={Boolean(this.state.anchorEl)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          anchorEl={this.state.anchorEl}
          classes={cn.popoverClasses}
          onClose={this.handleClose}
        >
          <Typography variant="h5">{this.props.label}</Typography>
          <Typography variant="body1" gutterBottom>
            {this.props.description}
          </Typography>
          {this.props.descriptionMoreURL ? (
            <a
              href={this.props.descriptionMoreURL}
              rel="noopener noreferrer"
              target="_blank"
            >
              <OpenInNew />
            </a>
          ) : null}
          <div>
            <Button
              variant="contained"
              color="primary"
              onClick={this.props.insertAsset}
            >
              <Add />
              {localization.editorCard.insert}
            </Button>
            <span className={cn.blank} />
            <Button
              variant="outlined"
              color="primary"
              disabled={disableOpenFile}
              onClick={this.props.openFile}
            >
              <Description />
              {localization.editorCard.edit(this.props.label)}
            </Button>
          </div>
        </Popover>
      </>
    );
  }
}
