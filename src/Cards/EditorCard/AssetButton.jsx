import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import Paper from '@material-ui/core/Paper';
import Popover from '@material-ui/core/Popover';
import RaisedButton from '@material-ui/core/RaisedButton';
import FloatingActionButton from '@material-ui/core/FloatingActionButton';
import { emphasize } from '@material-ui/core/styles/colorManipulator';
import ContentAdd from '@material-ui/core/svg-icons/content/add';
import ContentReply from '@material-ui/core/svg-icons/content/reply';
import ActionOpenInNew from '@material-ui/core/svg-icons/action/open-in-new';

const protocols = ['https:', 'http:', 'data:', 'file:', 'blob:'];

export default class AssetButton extends PureComponent {
  static propTypes = {
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

  static contextTypes = {
    muiTheme: PropTypes.object.isRequired
  };

  state = {
    open: false
  };

  handleOpen = event => {
    this.setState({ open: true, anchorEl: event.currentTarget });
  };

  handleInsert = () => {
    this.props.onClick(this.props);
  };

  render() {
    const { localization } = this.props;
    const { palette } = this.context.muiTheme;

    const styles = {
      root: {
        position: 'relative',
        width: 80,
        height: 80,
        margin: '8px 30px 0px 8px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        border: `4px outset ${palette.primary1Color}`,
        cursor: 'pointer',
        backgroundSize: 'contain',
        backgroundPosition: '50% 50%',
        backgroundRepeat: 'no-repeat'
      },
      popover: {
        padding: 8,
        maxWidth: 500
      },
      box: {
        display: 'flex',
        alignItems: 'baseline',
        justifyContent: 'space-between',
        marginBottom: 4
      },
      label: {
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        fontSize: 10,
        fontWeight: 600
      },
      headerLabel: {
        fontSize: 18,
        fontWeight: 600
      },
      description: {
        marginTop: 8,
        fontSize: '.7rem'
      },
      code: {
        display: 'block',
        padding: '0 .5rem',
        backgroundColor: emphasize(palette.canvasColor, 0.07),
        borderRadius: 2
      },
      pre: {
        fontFamily: 'Consolas, "Liberation Mono", Menlo, Courier, monospace'
      },
      button: {
        position: 'absolute',
        right: -34,
        bottom: -4,
        cursor: 'pointer'
      },
      icon: {
        transform: 'rotateX(180deg) rotateZ(180deg)'
      }
    };

    if (this.props.image) {
      if (protocols.some(p => this.props.image.indexOf(p) === 0)) {
        styles.root.backgroundImage = `url(${this.props.image})`;
      } else {
        const file = this.props.findFile(this.props.image);
        if (file) {
          styles.root.backgroundImage = `url(${file.blobURL})`;
        }
      }
    }

    return (
      <Paper style={styles.root} onClick={this.handleOpen}>
        <span style={styles.label}>{this.props.label}</span>
        <Popover
          open={this.state.open}
          anchorEl={this.state.anchorEl}
          style={styles.popover}
          onRequestClose={() => this.setState({ open: false })}
        >
          <div style={styles.box}>
            <span style={styles.headerLabel}>
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
            <RaisedButton
              primary
              label={localization.editorCard.insert}
              icon={<ContentAdd />}
              onClick={this.handleInsert}
            />
          </div>
          <div style={styles.description}>{this.props.description}</div>
          <code style={styles.code}>
            <pre style={styles.pre}>{this.props.code}</pre>
          </code>
        </Popover>
        <FloatingActionButton
          mini
          style={styles.button}
          onClick={this.handleInsert}
        >
          <ContentReply style={styles.icon} />
        </FloatingActionButton>
      </Paper>
    );
  }
}
