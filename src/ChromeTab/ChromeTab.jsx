import React, { PureComponent } from 'react';
import { withTheme } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import IconButton from '@material-ui/core/IconButton';
import NavigationClose from '@material-ui/icons/Close';
import EditorModeEdit from '@material-ui/icons/Edit';
import red from '@material-ui/core/colors/red';
import { emphasize, fade } from '@material-ui/core/styles/colorManipulator';

const MaxTabWidth = 160;
const MinTabWidth = 0;
const TabHeight = 32;
const TabSkewX = 24;

@withTheme()
export default class ChromeTabs extends PureComponent {
  static propTypes = {
    theme: PropTypes.object.isRequired,
    tab: PropTypes.object.isRequired,
    file: PropTypes.object.isRequired,
    tabs: PropTypes.array.isRequired,
    isSelected: PropTypes.bool.isRequired,
    handleSelect: PropTypes.func.isRequired,
    handleClose: PropTypes.func.isRequired,
    containerWidth: PropTypes.number.isRequired,
    localization: PropTypes.object.isRequired,
    doc: PropTypes.object
  };

  state = {
    doc: null,
    closerMouseOver: false,
    hasChanged: false
  };

  componentDidMount() {
    this.setDocIfNeeded(this.props.doc);
  }

  componentWillUnount() {
    if (this.state.doc) {
      this.state.doc.off('change', this.handleChange);
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.file !== this.props.file && this.props.doc) {
      this.handleChange(this.props.doc);
    }
    if (prevProps.doc !== this.props.doc) {
      this.setDocIfNeeded(this.props.doc);
    }
  }

  setDocIfNeeded = doc => {
    if (this.state.doc !== doc && doc) {
      doc.on('change', this.handleChange);
      this.handleChange(doc);
      if (this.state.doc) {
        this.state.doc.off('change', this.handleChange);
      }
      this.setState({ doc });
    }
  };

  handleChange = doc => {
    const hasChanged = doc.getValue() !== this.props.file.text;
    this.setState({ hasChanged });
  };

  render() {
    const { file, tab, handleSelect, handleClose, localization } = this.props;

    const { doc } = this.state;

    const { containerWidth, isSelected } = this.props;
    const { palette, spacing, fontFamily } = this.props.theme;
    const { closerMouseOver } = this.state;

    const tabHeight = TabHeight + (isSelected ? 1 : 0);
    const tabWidth = Math.min(
      MaxTabWidth,
      Math.max(MinTabWidth, containerWidth / this.props.tabs.length)
    );
    const blank = tabHeight / Math.tan(((90 - TabSkewX) / 180) * Math.PI);
    const backgroundColor = fade(
      isSelected
        ? palette.background.paper
        : emphasize(palette.background.paper),
      1
    );

    const blade = left => ({
      position: 'absolute',
      boxSizing: 'border-box',
      width: tabWidth - blank,
      height: tabHeight,
      left: left ? 0 : 'auto',
      right: left ? 'auto' : 0,
      borderTopWidth: left ? 0 : 1,
      borderRightWidth: left ? 0 : 1,
      borderBottomWidth: 0,
      borderLeftWidth: left ? 1 : 0,
      borderStyle: 'solid',
      borderColor: palette.primary.main,
      transform: `skewX(${(left ? -1 : 1) * TabSkewX}deg)`,
      backgroundColor,
      zIndex: left ? 1 : 2
    });

    const styles = {
      root: {
        flex: '1 1 auto',
        position: 'relative',
        boxSizing: 'border-box',
        maxWidth: MaxTabWidth,
        height: tabHeight,
        marginBottom: isSelected ? -1 : 0,
        zIndex: isSelected ? 2 : 1,
        fontFamily
      },
      left: blade(true),
      center: {
        position: 'absolute',
        width: tabWidth - blank,
        height: tabHeight,
        paddingLeft: blank / 2,
        paddingRight: blank / 2,
        zIndex: 3
      },
      right: blade(false),
      innerItem: {
        display: 'flex',
        alignItems: 'center',
        height: tabHeight
      },
      label: {
        flex: '1 1 auto',
        color: palette.text.primary,
        textDecoration: 'none',
        overflowX: 'hidden',
        whiteSpace: 'nowrap',
        fontSize: '.8em',
        cursor: 'default'
      },
      rightButton: {
        flex: '0 0 auto',
        padding: 0,
        width: spacing.unit * 3,
        height: spacing.unit * 3,
        margin: '0 -4px',
        transform: 'scale(0.55)',
        borderRadius: '50%',
        backgroundColor: closerMouseOver ? red['A200'] : 'transparent'
      }
    };

    const handleRightTouchTap = e => {
      e.stopPropagation();
      if (!this.state.hasChanged || confirm(localization.editorCard.notice)) {
        // タブがとじられるので Save されていない変更はリセットされる
        if (doc) {
          doc.setValue(file.text);
          doc.clearHistory();
        }
        handleClose(tab);
      }
    };

    const handleRightMouseEnter = () => {
      this.setState({ closerMouseOver: true });
    };

    const handleRightMouseLeave = () => {
      this.setState({ closerMouseOver: false });
    };

    const label = this.props.tabs.some(
      item => item !== tab && item.label === tab.label
    )
      ? tab.file.name
      : tab.label;

    return (
      <div style={styles.root} ref={this.handleRef}>
        <div style={styles.left} />
        <div style={styles.center}>
          <div style={styles.innerItem} onClick={() => handleSelect(tab)}>
            <a href="#" style={styles.label} title={this.props.file.name}>
              {label}
            </a>
            <IconButton
              style={styles.rightButton}
              onClick={handleRightTouchTap}
              onMouseEnter={handleRightMouseEnter}
              onMouseLeave={handleRightMouseLeave}
            >
              {this.state.closerMouseOver ? (
                <NavigationClose />
              ) : this.state.hasChanged ? (
                <EditorModeEdit />
              ) : (
                <NavigationClose />
              )}
            </IconButton>
          </div>
        </div>
        <div style={styles.right} />
      </div>
    );
  }
}
