import React, { PureComponent, PropTypes } from 'react';
import { Card } from 'material-ui/Card';
import IconButton from 'material-ui/IconButton';
import NavigationClose from 'material-ui/svg-icons/navigation/close';

const HeaderHeight = 32;

export default class CardWindow extends PureComponent {
  static propTypes = {
    name: PropTypes.string.isRequired,
    visible: PropTypes.bool.isRequired,
    order: PropTypes.number.isRequired,
    updateCard: PropTypes.func.isRequired,
    isResizing: PropTypes.bool.isRequired,
    scrollToCard: PropTypes.func.isRequired,
    actions: PropTypes.array.isRequired,
    cards: PropTypes.object.isRequired,
    icon: PropTypes.node.isRequired,
    fit: PropTypes.bool.isRequired
  };

  static defaultProps = {
    visible: false,
    actions: [],
    icon: null,
    fit: false
  };

  shouldComponentUpdate(nextProps) {
    if (this.props.isResizing && nextProps.isResizing) {
      return false;
    }
    return true;
  }

  get cardProps() {
    const props = {
      ...this.props
    };
    for (const key in CardWindow.propTypes) {
      delete props[key];
    }
    return props;
  }

  closeCard = () => {
    this.props.updateCard(this.props.name, { visible: false });
  };

  handleScroll = () => {
    this.props.scrollToCard(this.props.name);
  };

  renderCloseButton() {
    return (
      <IconButton
        onTouchTap={this.closeCard}
        iconStyle={{
          transform: 'scale(0.8)'
        }}
      >
        <NavigationClose />
      </IconButton>
    );
  }

  render() {
    const { isDragging, visible, fit, order } = this.props;

    const styles = {
      root: {
        width: 0,
        order,
        boxSizing: 'border-box',
        maxWidth: '100%',
        maxHeight: '100%',
        direction: 'ltr',
        flex: '0 0 auto',
        flexBasis: visible ? '500px' : 0,
        padding: visible ? '16px 20px 16px 0' : 0,
        overflow: visible ? 'initial' : 'hidden'
      },
      innerContainer: {
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      },
      header: {
        flex: 0,
        display: 'flex',
        alignItems: 'center',
        minHeight: HeaderHeight,
        paddingLeft: 8,
        width: '100%',
        boxSizing: 'border-box',
        overflowX: 'auto',
        overflowY: 'hidden'
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
    if (fit) {
      styles.card = { height: '100%' };
    } else {
      styles.card = { maxHeight: '100%' };
    }

    return (
      <div id={this.props.name} style={styles.root}>
        <Card
          {...this.cardProps}
          style={styles.card}
          containerStyle={styles.innerContainer}
        >
          <div style={styles.header}>
            <a style={styles.a} onTouchTap={this.handleScroll}>
              {this.props.icon}
            </a>
            <div style={styles.blank} />
            {this.props.actions}
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
