import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
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
    scrollToCard: PropTypes.func.isRequired,
    actions: PropTypes.array.isRequired,
    cards: PropTypes.object.isRequired,
    icon: PropTypes.node.isRequired,
    fit: PropTypes.bool.isRequired,
    width: PropTypes.number.isRequired,
    disableCloseButton: PropTypes.bool.isRequired,
    showAll: PropTypes.bool.isRequired,
    footer: PropTypes.node
  };

  static defaultProps = {
    visible: false,
    actions: [],
    icon: null,
    fit: false,
    disableCloseButton: false, // ボタンで閉じられないようにする
    width: 480,
    footer: null
  };

  componentDidUpdate(prevProps) {
    if (prevProps.visible !== this.props.visible && this.props.visible) {
      this.handleScroll();
    }
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

  render() {
    const { visible, fit, order } = this.props;

    const fitWrap = fit
      ? {
          display: 'flex'
        }
      : {
          maxHeight: '100%'
        };

    const styles = {
      root: {
        position: 'relative',
        width: 0,
        order,
        boxSizing: 'border-box',
        maxWidth: '100%',
        maxHeight: '100%',
        height: '100%',
        direction: 'ltr',
        flex: '0 0 auto',
        flexBasis: visible ? '50%' : 0,
        padding: visible ? '16px 20px 16px 0' : 0,
        overflow: visible ? 'initial' : 'hidden',
        ...fitWrap
      },
      card: {
        flex: 1,
        ...fitWrap
      },
      innerContainer: {
        position: 'relative',
        width: '100%',
        flexDirection: 'column',
        ...fitWrap
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
      },
      close: {
        transform: 'scale(0.8)'
      }
    };

    return (
      <div id={this.props.name} style={styles.root}>
        <Card
          {...this.cardProps}
          style={styles.card}
          containerStyle={styles.innerContainer}
        >
          <div style={styles.header}>
            <a style={styles.a} onClick={this.handleScroll}>
              {this.props.icon}
            </a>
            <div style={styles.blank} />
            {this.props.actions}
            {this.props.disableCloseButton ? null : (
              <IconButton onClick={this.closeCard} iconStyle={styles.close}>
                <NavigationClose />
              </IconButton>
            )}
          </div>
          {this.props.children}
        </Card>
        {this.props.footer || null}
        <div id={`${this.props.name}-BottomAnchor`} />
      </div>
    );
  }
}
