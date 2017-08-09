import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import Paper from 'material-ui/Paper';
import Popover from 'material-ui/Popover';
import RaisedButton from 'material-ui/RaisedButton';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import { emphasize } from 'material-ui/utils/colorManipulator';
import ContentAdd from 'material-ui/svg-icons/content/add';
import ContentReply from 'material-ui/svg-icons/content/reply';
import ActionOpenInNew from 'material-ui/svg-icons/action/open-in-new';

export default class AssetButton extends PureComponent {
  static propTypes = {
    code: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    descriptionMoreURL: PropTypes.string,
    label: PropTypes.string,
    image: PropTypes.string,
    onTouchTap: PropTypes.func.isRequired,
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

  handleInsert = event => {
    this.props.onTouchTap(this.props);
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
        cursor: 'pointer'
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
      const file = this.props.findFile(this.props.image);
      if (file) {
        styles.root = {
          ...styles.root,
          backgroundImage: `url(${file.blobURL})`,
          backgroundSize: 'contain',
          backgroundPosition: '50% 50%',
          backgroundRepeat: 'no-repeat'
        };
      }
    }

    return (
      <Paper style={styles.root} onTouchTap={this.handleOpen}>
        <span style={styles.label}>
          {this.props.label}
        </span>
        <Popover
          open={this.state.open}
          anchorEl={this.state.anchorEl}
          style={styles.popover}
          onRequestClose={() => this.setState({ open: false })}
        >
          <div style={styles.box}>
            <span style={styles.headerLabel}>
              {this.props.label}
              {this.props.descriptionMoreURL
                ? <a href={this.props.descriptionMoreURL} target="_blank">
                    <ActionOpenInNew />
                  </a>
                : null}
            </span>
            <RaisedButton
              primary
              label={localization.editorCard.insert}
              icon={<ContentAdd />}
              onTouchTap={this.handleInsert}
            />
          </div>
          <div style={styles.description}>
            {this.props.description}
          </div>
          <code style={styles.code}>
            <pre style={styles.pre}>
              {this.props.code}
            </pre>
          </code>
        </Popover>
        <FloatingActionButton
          mini
          style={styles.button}
          onTouchTap={this.handleInsert}
        >
          <ContentReply style={styles.icon} />
        </FloatingActionButton>
      </Paper>
    );
  }
}
