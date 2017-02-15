import React, {PureComponent, PropTypes} from 'react';
import {Element} from 'react-scroll';
import {Card} from 'material-ui/Card';
import IconButton from 'material-ui/IconButton';
import NavigationExpandMore from 'material-ui/svg-icons/navigation/expand-more';
import NavigationExpandLess from 'material-ui/svg-icons/navigation/expand-less';
import NavigationClose from 'material-ui/svg-icons/navigation/close';
import ActionAccessibility from 'material-ui/svg-icons/action/accessibility';

const HeaderHeight = 32;

export default class CardWindow extends PureComponent {

  static propTypes = {
    name: PropTypes.string.isRequired,
    visible: PropTypes.bool.isRequired,
    localization: PropTypes.object.isRequired,
    updateCard: PropTypes.func.isRequired,
    isResizing: PropTypes.bool.isRequired,
    actions: PropTypes.array.isRequired
  };

  static defaultProps = {
    actions: []
  };

  state = {
    expanded: false,
    localized: this.props.localization[lowerCaseAtFirst(this.props.name)]
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
      location.hash = this.props.name;
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
        padding: 16,
        paddingBottom: 0
      },
      header: {
        display: 'flex',
        alignItems: 'center',
        height: HeaderHeight,
        paddingLeft: 8
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
            <div style={styles.title}>{this.state.localized.title}</div>
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
  MonitorCard: <ActionAccessibility color="gray" />,
  ShotCard: <ActionAccessibility color="gray" />,
  EditorCard: <ActionAccessibility color="gray" />,
  MediaCard: <ActionAccessibility color="gray" />,
  CreditsCard: <ActionAccessibility color="gray" />,
  ReadmeCard: <ActionAccessibility color="gray" />,
  PaletteCard: <ActionAccessibility color="gray" />,
  SnippetCard: <ActionAccessibility color="gray" />,
  EnvCard: <ActionAccessibility color="gray" />,
  HierarchyCard: <ActionAccessibility color="gray" />,
  CustomizeCard: <ActionAccessibility color="gray" />,
};
