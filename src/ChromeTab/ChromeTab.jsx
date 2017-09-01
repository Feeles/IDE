import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import IconButton from 'material-ui/IconButton';
import NavigationClose from 'material-ui/svg-icons/navigation/close';
import EditorModeEdit from 'material-ui/svg-icons/editor/mode-edit';
import { transparent, redA200 } from 'material-ui/styles/colors';
import { emphasize, fade } from 'material-ui/utils/colorManipulator';

const MaxTabWidth = 160;
const MinTabWidth = 0;
const TabHeight = 32;
const TabSkewX = 24;

const getStyles = (props, context, state) => {
  const { containerWidth, isSelected } = props;
  const { palette, spacing, fontFamily } = context.muiTheme;
  const { closerMouseOver } = state;

  const tabHeight = TabHeight + (isSelected ? 1 : 0);
  const tabWidth = Math.min(
    MaxTabWidth,
    Math.max(MinTabWidth, containerWidth / props.tabs.length)
  );
  const blank = tabHeight / Math.tan((90 - TabSkewX) / 180 * Math.PI);
  const backgroundColor = fade(
    isSelected ? palette.canvasColor : emphasize(palette.canvasColor),
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
    borderColor: palette.primary1Color,
    transform: `skewX(${(left ? -1 : 1) * TabSkewX}deg)`,
    backgroundColor,
    zIndex: left ? 1 : 2
  });

  return {
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
      color: palette.textColor,
      textDecoration: 'none',
      overflowX: 'hidden',
      whiteSpace: 'nowrap',
      fontSize: '.8em',
      cursor: 'default'
    },
    rightButton: {
      flex: '0 0 auto',
      padding: 0,
      width: spacing.iconSize,
      height: spacing.iconSize,
      margin: '0 -4px',
      transform: 'scale(0.55)',
      borderRadius: '50%',
      backgroundColor: closerMouseOver ? redA200 : transparent
    }
  };
};

export default class ChromeTabs extends PureComponent {
  static propTypes = {
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

  static contextTypes = {
    muiTheme: PropTypes.object.isRequired
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
    if (prevProps.file !== this.props.file) {
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
    const {
      file,
      tab,
      isSelected,
      handleSelect,
      handleClose,
      localization
    } = this.props;
    const {
      palette: { secondaryTextColor, alternateTextColor },
      prepareStyles
    } = this.context.muiTheme;
    const { closerMouseOver, doc } = this.state;

    const styles = getStyles(this.props, this.context, this.state);

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

    const handleRightMouseEnter = e => {
      this.setState({ closerMouseOver: true });
    };

    const handleRightMouseLeave = e => {
      this.setState({ closerMouseOver: false });
    };

    const label = this.props.tabs.some(
      item => item !== tab && item.label === tab.label
    )
      ? tab.file.name
      : tab.label;

    return (
      <div style={prepareStyles(styles.root)} ref={this.handleRef}>
        <div style={prepareStyles(styles.left)} />
        <div style={prepareStyles(styles.center)}>
          <div
            style={prepareStyles(styles.innerItem)}
            onTouchTap={() => handleSelect(tab)}
          >
            <a
              href="#"
              style={prepareStyles(styles.label)}
              title={this.props.file.name}
            >
              {label}
            </a>
            <IconButton
              style={styles.rightButton}
              onTouchTap={handleRightTouchTap}
              onMouseEnter={handleRightMouseEnter}
              onMouseLeave={handleRightMouseLeave}
            >
              {this.state.closerMouseOver ? (
                <NavigationClose color={alternateTextColor} />
              ) : this.state.hasChanged ? (
                <EditorModeEdit color={secondaryTextColor} />
              ) : (
                <NavigationClose color={secondaryTextColor} />
              )}
            </IconButton>
          </div>
        </div>
        <div style={prepareStyles(styles.right)} />
      </div>
    );
  }
}
