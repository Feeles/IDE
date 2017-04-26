import React, { PureComponent, PropTypes } from 'react';
import Paper from 'material-ui/Paper';
import Popover from 'material-ui/Popover';
import RaisedButton from 'material-ui/RaisedButton';
import { emphasize } from 'material-ui/utils/colorManipulator';
import ContentAdd from 'material-ui/svg-icons/content/add';

export default class AssetButton extends PureComponent {

  static propTypes = {
    code: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    label: PropTypes.string,
    image: PropTypes.string,
    onTouchTap: PropTypes.func.isRequired,
    findFile: PropTypes.func.isRequired,
    localization: PropTypes.object.isRequired,
  };

  static contextTypes = {
    muiTheme: PropTypes.object.isRequired,
  };

  state = {
    open: false,
  };

  handleOpen = (event) => {
    this.setState({
      open: true,
      anchorEl: event.currentTarget,
    });
  };

  handleInsert = (event) => {
    this.props.onTouchTap(this.props);
  };

  render() {
    const {
      localization,
    } = this.props;
    const {
      palette,
    } = this.context.muiTheme;

    const styles = {
      root: {
        position: 'relative',
        width: 80,
        height: 80,
        margin: 8,
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        border: `4px outset ${palette.primary1Color}`,
        cursor: 'pointer',
      },
      popover: {
        padding: 8,
      },
      box: {
        display: 'flex',
        alignItems: 'baseline',
        justifyContent: 'space-between',
        marginBottom: 4,
      },
      label: {
        flex: '1 1 auto',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
      },
      label: {
        fontWeight: 600,
      },
      description: {
        fontSize: '.7rem',
      },
      code: {
        display: 'block',
        padding: '0 .5rem',
        backgroundColor: emphasize(palette.canvasColor, 0.07),
        borderRadius: 2,
      },
      button: {
        position: 'absolute',
        right: 0,
        bottom: 0,
        cursor: 'pointer'
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
          backgroundRepeat: 'no-repeat',
        };
      }
    }

    return (
      <Paper style={styles.root} onTouchTap={this.handleOpen}>
        <span style={styles.label}>{this.props.label}</span>
        <Popover
          open={this.state.open}
          anchorEl={this.state.anchorEl}
          style={styles.popover}
          onRequestClose={() => this.setState({open: false})}
        >
          <div style={styles.box}>
            <span style={styles.label}>{this.props.label}</span>
            <RaisedButton primary label={localization.editorCard.insert} icon={<ContentAdd />} onTouchTap={this.handleInsert} />
          </div>
          <div style={styles.description}>{this.props.description}</div>
          <code style={styles.code}><pre>{this.props.code}</pre></code>
        </Popover>
        <ContentAdd
          color={palette.primary1Color}
          style={styles.button}
          onTouchTap={this.handleInsert}
        />
      </Paper>
    );
  }
}
