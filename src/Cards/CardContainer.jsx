import React, { PureComponent, PropTypes } from 'react';

import * as Cards from './';

export default class CardContainer extends PureComponent {
  static propTypes = {
    cards: PropTypes.object.isRequired,
    getConfig: PropTypes.func.isRequired,
    cardProps: PropTypes.object.isRequired,
    updateCard: PropTypes.func.isRequired,
    localization: PropTypes.object.isRequired,
    findFile: PropTypes.func.isRequired,
    showAll: PropTypes.bool.isRequired
  };

  state = {
    // smooth scroll のターゲット
    scrollTarget: null
  };

  scrollToCard = name => {
    // Cards[name] にスクロールする
    const scrollTarget = document.getElementById(name);
    if (scrollTarget) {
      const startSmoothScroll = !this.state.scrollTarget;
      this.setState({ scrollTarget }, () => {
        if (startSmoothScroll) {
          this.scroll();
        }
      });
    }
  };

  scroll() {
    // Scroll into view (shallow) element
    const { scrollTarget } = this.state;
    if (scrollTarget) {
      const rect = scrollTarget.getBoundingClientRect();
      const offset = 16;
      let difference = 0;
      if (rect.left < offset) {
        difference = rect.left - offset;
      } else if (rect.right > window.innerWidth) {
        difference = rect.right - window.innerWidth;
      }

      if (Math.abs(difference) > 1) {
        const sign = Math.sign(difference);
        // smooth scroll
        scrollTarget.parentNode.scrollLeft += difference / 5 + sign * 5;
        requestAnimationFrame(() => {
          this.scroll();
        });
      } else {
        this.setState({ scrollTarget: null });
      }
    }
  }

  render() {
    // (暫定) 背景画像
    const bg =
      this.props.findFile('feeles/background.png') ||
      this.props.findFile('feeles/background.jpg');

    const styles = {
      container: {
        flex: 1,
        height: 0,
        position: 'relative',
        display: 'flex',
        alignItems: 'stretch',
        overflowX: 'scroll',
        overflowY: 'hidden',
        paddingLeft: 16,
        boxSizing: 'border-box',
        backgroundImage: bg && `url(${bg.blobURL})`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        backgroundSize: 'contain'
      }
    };

    const cards = [];
    for (const [name, item] of Object.entries(this.props.cards)) {
      const component = Cards[name];
      const cardPropsBag = {
        name,
        visible: item.visible,
        order: item.order,
        isResizing: false, // Deprecated
        updateCard: this.props.updateCard,
        scrollToCard: this.scrollToCard,
        cards: this.props.cards,
        showAll: this.props.showAll
      };
      cards.push(
        React.createElement(component, {
          key: name,
          cardPropsBag,
          ...this.props.cardProps[name]
        })
      );
    }

    return (
      <div style={styles.container}>
        {cards}
      </div>
    );
  }
}
