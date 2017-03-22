import React, {PureComponent, PropTypes} from 'react';
import {Element, scroller} from 'react-scroll';
import {Card} from 'material-ui/Card';
import IconButton from 'material-ui/IconButton';
import NavigationExpandMore from 'material-ui/svg-icons/navigation/expand-more';
import NavigationExpandLess from 'material-ui/svg-icons/navigation/expand-less';
import NavigationClose from 'material-ui/svg-icons/navigation/close';

// Card Icons
import ContentReply from 'material-ui/svg-icons/content/reply';
import ContentCreate from 'material-ui/svg-icons/content/create';
import ActionCopyright from 'material-ui/svg-icons/action/copyright';
import ActionTouchApp from 'material-ui/svg-icons/action/touch-app';
import ActionSettingsApplications from 'material-ui/svg-icons/action/settings-applications';
import ImagePalette from 'material-ui/svg-icons/image/palette';
import AvMusicVideo from 'material-ui/svg-icons/av/music-video';
import HardwareDesktopWindows from 'material-ui/svg-icons/hardware/desktop-windows';
import MapsMap from 'material-ui/svg-icons/maps/map';
import FileFolderOpen from 'material-ui/svg-icons/file/folder-open';

const HeaderHeight = 32;

export default class CardWindow extends PureComponent {

  static propTypes = {
    name: PropTypes.string.isRequired,
    visible: PropTypes.bool.isRequired,
    updateCard: PropTypes.func.isRequired,
    isResizing: PropTypes.bool.isRequired,
    scrollToCard: PropTypes.func.isRequired,
    actions: PropTypes.array.isRequired,
    cards: PropTypes.object.isRequired,
  };

  static defaultProps = {
    visible: false,
    actions: []
  };

  state = {
    expanded: false,
  };

  componentWillMount() {
    if (this.props.initiallyExpanded && this.props.visible) {
      this.toggleExpand();
    }
  }

  shouldComponentUpdate(nextProps) {
    if (this.props.isResizing && nextProps.isResizing) {
      return false;
    }
    return true;
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.visible !== nextProps.visible) {
      if (nextProps.visible && nextProps.initiallyExpanded) {
        this.toggleExpand();
      }
      if (!nextProps.visible && this.state.expanded) {
        this.toggleExpand();
      }
    }
  }

  componentDidUpdate(prevProps) {
    if (!prevProps.visible && this.props.visible) {
      this.props.scrollToCard(this.props.name);
    }
  }

  get cardProps() {
    const props = {
      ...this.props,
      expanded: this.state.expanded
    };
    for (const key in CardWindow.propTypes) {
      delete props[key];
    }
    return props;
  }

  toggleExpand = () => {
    this.setState(prevState => {
      const expanded = !prevState.expanded;
      if (this.props.onExpandChange) {
        this.props.onExpandChange(expanded);
      }
      return {expanded};
    });
  };

  closeCard = () => {
    this.props.updateCard(this.props.name, {visible: false});
  };

  renderExpandButton() {
    return (
      <IconButton onTouchTap={this.toggleExpand}>
        {this.state.expanded
          ? (<NavigationExpandLess/>)
          : (<NavigationExpandMore/>)}
      </IconButton>
    );
  }

  renderCloseButton() {
    return (
      <IconButton onTouchTap={this.closeCard} iconStyle={{
        transform: 'scale(0.8)'
      }}>
        <NavigationClose/>
      </IconButton>
    );
  }

  render() {
    if (!this.props.visible) {
      return <Element name={this.props.name}></Element>;
    }

    const {connectDragSource, connectDragPreview, isDragging} = this.props;

    const styles = {
      root: {
        direction: 'ltr',
        paddingTop: 16,
        paddingLeft: 20,
        paddingRight: 20,
      },
      header: {
        display: 'flex',
        alignItems: 'center',
        height: HeaderHeight,
        paddingLeft: 8,
        width: '100%',
        boxSizing: 'border-box',
        overflowX: 'auto',
        overflowY: 'hidden',
      },
      title: {
        flex: '0 0 auto',
        marginLeft: 6,
        fontSize: '.8rem'
      },
      blank: {
        flex: '1 1 auto'
      },
      a: {
        display: 'inherit'
      }
    };

    return (
      <Element name={this.props.name} style={styles.root}>
        <Card {...this.cardProps}>
          <div style={styles.header}>
            <a href={'#' + this.props.name} style={styles.a}>{CardIcons[this.props.name]}</a>
            <div style={styles.blank}></div>
            {this.props.actions}
            {this.renderExpandButton()}
            {this.renderCloseButton()}
          </div>
          {this.props.children}
        </Card>
      </Element>
    );
  }
}

function lowerCaseAtFirst(string) {
  return string[0].toLowerCase() + string.substr(1);
}

export const CardIcons = {
  MonitorCard: <HardwareDesktopWindows color="gray" />,
  ShotCard: <ContentReply color="gray" style={{transform:'rotateY(180deg)'}} />,
  EditorCard: <ContentCreate color="gray" />,
  MediaCard: <AvMusicVideo color="gray" />,
  CreditsCard: <ActionCopyright color="gray" />,
  ReadmeCard: <MapsMap color="gray" />,
  PaletteCard: <ImagePalette color="gray" />,
  EnvCard: <ActionTouchApp color="gray" />,
  HierarchyCard: <FileFolderOpen color="gray" />,
  CustomizeCard: <ActionSettingsApplications color="gray" />,
};
