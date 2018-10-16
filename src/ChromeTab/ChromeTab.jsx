import React, { PureComponent } from 'react';
import { withTheme } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import IconButton from '@material-ui/core/IconButton';
import NavigationClose from '@material-ui/icons/Close';
import EditorModeEdit from '@material-ui/icons/Edit';
import red from '@material-ui/core/colors/red';
import { emphasize, fade } from '@material-ui/core/styles/colorManipulator';
import { style } from 'typestyle';
import { skew, deg } from 'csx';

const MaxTabWidth = 160;
const MinTabWidth = 0;
const TabHeight = 32;
const TabSkewX = 24;

const getCn = props => {
  const tabHeight = TabHeight + (props.isSelected ? 1 : 0);
  const tabWidth = Math.min(
    MaxTabWidth,
    Math.max(MinTabWidth, props.containerWidth / props.tabs.length)
  );
  const blank = tabHeight / Math.tan((90 - TabSkewX) / 180 * Math.PI);
  const backgroundColor = fade(
    props.isSelected
      ? props.theme.palette.background.paper
      : emphasize(props.theme.palette.background.paper),
    1
  );

  const blade = left =>
    style({
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
      borderColor: props.theme.palette.primary.main,
      transform: skew(deg((left ? -1 : 1) * TabSkewX)),
      backgroundColor,
      zIndex: left ? 1 : 2
    });

  return {
    root: style({
      flex: '1 1 auto',
      position: 'relative',
      boxSizing: 'border-box',
      maxWidth: MaxTabWidth,
      height: tabHeight,
      marginBottom: props.isSelected ? -1 : 0,
      zIndex: props.isSelected ? 2 : 1,
      fontFamily: props.theme.fontFamily
    }),
    left: blade(true),
    center: style({
      position: 'absolute',
      width: tabWidth - blank,
      height: tabHeight,
      paddingLeft: blank / 2,
      paddingRight: blank / 2,
      zIndex: 3
    }),
    right: blade(false),
    innerItem: style({
      display: 'flex',
      alignItems: 'center',
      height: tabHeight
    }),
    label: style({
      flex: '1 1 auto',
      color: props.theme.palette.text.primary,
      textDecoration: 'none',
      overflowX: 'hidden',
      whiteSpace: 'nowrap',
      fontSize: '.8em',
      cursor: 'default'
    }),
    rightButton: style({
      flex: '0 0 auto',
      padding: 0,
      width: props.theme.spacing.unit * 3,
      height: props.theme.spacing.unit * 3,
      margin: '0 -4px',
      transform: 'scale(0.55)',
      borderRadius: '50%',
      '&:hover': {
        backgroundColor: red['A200']
      }
    })
  };
};

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
    const dcn = getCn(this.props);
    const { file, tab, handleSelect, handleClose, localization } = this.props;

    const { doc } = this.state;

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
      <div className={dcn.root} ref={this.handleRef}>
        <div className={dcn.left} />
        <div className={dcn.center}>
          <div className={dcn.innerItem} onClick={() => handleSelect(tab)}>
            <a href="#" className={dcn.label} title={this.props.file.name}>
              {label}
            </a>
            <IconButton
              className={dcn.rightButton}
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
        <div className={dcn.right} />
      </div>
    );
  }
}
