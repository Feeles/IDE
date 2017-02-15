import React, {PureComponent, PropTypes} from 'react';
import {Element} from 'react-scroll';
import {Card} from 'material-ui/Card';
import IconButton from 'material-ui/IconButton';
import NavigationExpandMore from 'material-ui/svg-icons/navigation/expand-more';
import NavigationExpandLess from 'material-ui/svg-icons/navigation/expand-less';
import NavigationClose from 'material-ui/svg-icons/navigation/close';

const HeaderHeight = 32;

export default class CardWindow extends PureComponent {

  static propTypes = {
    name: PropTypes.string.isRequired,
    visible: PropTypes.bool.isRequired,
    localization: PropTypes.object.isRequired,
    updateCard: PropTypes.func.isRequired,
    isResizing: PropTypes.bool.isRequired,
    actions: PropTypes.array.isRequired,
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
        height: HeaderHeight
      },
      title: {
        flex: '0 0 auto',
        marginLeft: '1rem',
        fontSize: '.8rem'
      },
      blank: {
        flex: '1 1 auto'
      }
    };

    return (
      <Element name={this.props.name} style={styles.root}>
        <Card {...this.cardProps}>
          <div style={styles.header}>
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
