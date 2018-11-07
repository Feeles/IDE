import React, { PureComponent } from 'react';
import { withTheme } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import { style } from 'typestyle';
import { url } from 'csx';
import Paper from '@material-ui/core/Paper';
import Popover from '@material-ui/core/Popover';
import Button from '@material-ui/core/Button';
import { emphasize } from '@material-ui/core/styles/colorManipulator';
import ContentAdd from '@material-ui/icons/Add';
import ContentReply from '@material-ui/icons/Reply';
import ActionOpenInNew from '@material-ui/icons/OpenInNew';

const protocols = ['https:', 'http:', 'data:', 'file:', 'blob:'];

const cn = {
  popover: style({
    padding: 8,
    maxWidth: 500
  }),
  box: style({
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: 4
  }),
  label: style({
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    fontSize: 10,
    fontWeight: 600
  }),
  headerLabel: style({
    fontSize: 18,
    fontWeight: 600
  }),
  description: style({
    marginTop: 8,
    fontSize: '.7rem'
  }),
  code: style({
    display: 'block',
    padding: '0 .5rem',
    borderRadius: 2
  }),
  pre: style({
    fontFamily: 'Consolas, "Liberation Mono", Menlo, Courier, monospace'
  }),
  button: style({
    position: 'absolute',
    right: -34,
    bottom: -4,
    cursor: 'pointer'
  }),
  icon: style({
    transform: 'rotateX(180deg) rotateZ(180deg)'
  })
};
const getCn = props => ({
  root: style({
    position: 'relative',
    width: 80,
    height: 80,
    margin: '8px 30px 0px 8px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    cursor: 'pointer',
    backgroundSize: 'contain',
    backgroundPosition: '50% 50%',
    backgroundRepeat: 'no-repeat',
    border: `4px outset ${props.theme.palette.primary.main}`
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
    onClick: PropTypes.func.isRequired,
    findFile: PropTypes.func.isRequired,
    localization: PropTypes.object.isRequired
  };

  static defaultProps = {
    description: ''
  };

  state = {
    open: false,
    backgroundStyle: {}
  };

  handleOpen = event => {
    this.setState({ open: true, anchorEl: event.currentTarget });
  };

  handleInsert = () => {
    this.props.onClick(this.props);
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
    const { palette } = this.props.theme;

    return (
      <>
        <Paper
          className={dcn.root}
          style={this.state.backgroundStyle}
          onClick={this.handleOpen}
        >
          <span className={cn.label}>{this.props.label}</span>
          <Button
            variant="fab"
            mini
            className={cn.button}
            onClick={this.handleInsert}
          >
            <ContentReply className={cn.icon} />
          </Button>
        </Paper>
        <Popover
          open={this.state.open}
          anchorEl={this.state.anchorEl}
          classes={{ paper: cn.popover }}
          onClose={() => this.setState({ open: false })}
        >
          <div className={cn.box}>
            <span className={cn.headerLabel}>
              {this.props.label}
              {this.props.descriptionMoreURL ? (
                <a
                  href={this.props.descriptionMoreURL}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <ActionOpenInNew />
                </a>
              ) : null}
            </span>
            <Button
              variant="contained"
              color="primary"
              onClick={this.handleInsert}
            >
              <ContentAdd />
              {localization.editorCard.insert}
            </Button>
          </div>
          <div className={cn.description}>{this.props.description}</div>
          <code
            className={cn.code}
            style={{
              backgroundColor: emphasize(palette.background.paper, 0.07)
            }}
          >
            <pre className={cn.pre}>{this.props.code}</pre>
          </code>
        </Popover>
      </>
    );
  }
}
