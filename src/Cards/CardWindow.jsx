import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import Card from '@material-ui/core/Card';

const HeaderHeight = 32;

export default class CardWindow extends PureComponent {
  static propTypes = {
    name: PropTypes.string.isRequired,
    visible: PropTypes.bool.isRequired,
    order: PropTypes.number.isRequired,
    actions: PropTypes.array.isRequired,
    cardProps: PropTypes.object.isRequired,
    icon: PropTypes.node.isRequired,
    fit: PropTypes.bool.isRequired,
    width: PropTypes.number.isRequired,
    showAll: PropTypes.bool.isRequired,
    footer: PropTypes.node
  };

  static defaultProps = {
    visible: false,
    actions: [],
    icon: null,
    fit: false,
    width: 480,
    footer: null
  };

  get cardProps() {
    const props = {
      ...this.props
    };
    for (const key in CardWindow.propTypes) {
      delete props[key];
    }
    return props;
  }

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
      blank: {
        flex: '1 1 auto'
      }
    };

    return (
      <div id={this.props.name} style={styles.root}>
        <Card {...this.cardProps} style={styles.card}>
          <div style={styles.innerContainer}>
            <div style={styles.header}>
              <span>{this.props.icon}</span>
              <div style={styles.blank} />
              {this.props.actions}
            </div>
            {this.props.children}
          </div>
        </Card>
        {this.props.footer || null}
        <div id={`${this.props.name}-BottomAnchor`} />
      </div>
    );
  }
}
