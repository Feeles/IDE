import React, {PureComponent, PropTypes} from 'react';
import {Card} from 'material-ui/Card';
import IconButton from 'material-ui/IconButton';
import NavigationExpandMore from 'material-ui/svg-icons/navigation/expand-more';
import NavigationExpandLess from 'material-ui/svg-icons/navigation/expand-less';
import NavigationClose from 'material-ui/svg-icons/navigation/close';

const HeaderHeight = 32;

export default class CardWindow extends PureComponent {

  static propTypes = {
    name: PropTypes.string.isRequired,
    localization: PropTypes.object.isRequired,
    cards: PropTypes.array.isRequired,
    toggleCard: PropTypes.func.isRequired,
    isResizing: PropTypes.bool.isRequired
  };

  state = {
    expanded: false,
    localized: this.props.localization[lowerCaseAtFirst(this.props.name)]
  };

  componentWillMount() {
    if (this.props.initiallyExpanded) {
      this.toggleExpand();
    }
  }

  shouldComponentUpdate(nextProps) {
    if (this.props.isResizing && nextProps.isResizing) {
      return false;
    }

    return true;
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

  get card() {
    return this.props.cards.find(item => {
      return item.name === this.props.name;
    }, this);
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
    this.props.toggleCard(this.props.name);
    this.toggleExpand();
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
    if (this.card.visible === false) {
      return null;
    }

    const styles = {
      root: {
        marginTop: 16,
        marginLeft: 16,
        marginRight: 16
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
      <div id={this.props.name} style={styles.root}>
        <Card {...this.cardProps}>
          <div style={styles.header}>
            <div style={styles.title}>{this.state.localized.title}</div>
            <div style={styles.blank}></div>
            {this.renderExpandButton()}
            {this.renderCloseButton()}
          </div>
          {this.props.children}
        </Card>
      </div>
    );
  }
}

function lowerCaseAtFirst(string) {
  return string[0].toLowerCase() + string.substr(1);
}
