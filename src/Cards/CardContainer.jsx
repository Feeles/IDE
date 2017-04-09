import React, {PureComponent, PropTypes} from 'react';
import {Events, scroller} from 'react-scroll';
import {DropTarget} from 'react-dnd';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import transitions from 'material-ui/styles/transitions';

import Sizer, {SizerWidth} from './Sizer';
import DragTypes from '../utils/dragTypes';
import * as Cards from './';

const LeftContainerId = 'CardContainerLeft';
const RightContainerId = 'CardContainerRight';

class CardContainer extends PureComponent {

  static propTypes = {
    cards: PropTypes.object.isRequired,
    getConfig: PropTypes.func.isRequired,
    rootWidth: PropTypes.number.isRequired,
    cardProps: PropTypes.object.isRequired,
    updateCard: PropTypes.func.isRequired,
    localization: PropTypes.object.isRequired,
    showCardIcon: PropTypes.bool.isRequired,
    findFile: PropTypes.func.isRequired,

    connectDropTarget: PropTypes.func.isRequired
  };

  state = {
    isResizing: false,
    rightSideWidth: this.props.rootWidth / 2,
    scrolledLeft: null,
    scrolledRight: null,
  };

  componentDidUpdate(prevProps) {
    if (prevProps.cards !== this.props.cards) {
      for (const [name, card] of Object.entries(this.props.cards)) {
        const prev = prevProps.cards[name];
        const next = this.props.cards[name];
        if (prev && prev.visible !== next.visible) {
          this.handleVisibilityChanged(name, next.visible);
        }
      }
    }
  }

  // react-scroll はイベント重複時に前のイベントをキャンセルしてしまう.
  // もう一度スクロールさせるためにスタック(FILO)をのこす
  _eventStack = [];
  componentDidMount() {
    window.addEventListener('hashchange', this.handleHashChange);
    Events.scrollEvent.register('begin', (to) => {
      if (!this._eventStack.includes(to)) {
        this._eventStack.push(to);
      }
    });
    const lastOf = (array) => array.length ? array[array.length - 1] : undefined;
    Events.scrollEvent.register('end', (to) => {
      if (lastOf(this._eventStack) === to) {
        this._eventStack.pop();
        if (lastOf(this._eventStack)) {
          this.scrollToCard(lastOf(this._eventStack), true);
        }
      }
    });
  }

  componentWillUnmount() {
    window.removeEventListener('hashchange', this.handleHashChange);
    Events.scrollEvent.remove('begin');
    Events.scrollEvent.remove('end');
  }

  handleHashChange = () => {
    if (!location.hash) return;
    const name = location.hash.substr(1);
    this.scrollToCard(name);
  };

  scrollToCard = (name) => {
    const card = this.props.cards[name];
    if (card) {
      const isLeft = card.order % this.column === 1;
      const containerId = isLeft ? LeftContainerId : RightContainerId;
      scroller.scrollTo(name, {
        containerId,
        smooth: true,
        duration: 250,
      });
      if (isLeft) {
        this.setState({scrolledLeft: name});
      } else {
        this.setState({scrolledRight: name});
      }
      location.hash = '';
    }
  };

  get column() {
    return 1 + (this.props.rootWidth > 991);
  }

  get left() {
    const cards = [];
    for (const [name, item] of Object.entries(this.props.cards)) {
      if (item.order % this.column === 1) {
        cards.push({...item, name});
      }
    }
    return cards.sort((a, b) => a.order - b.order);
  }

  get right() {
    const cards = [];
    for (const [name, item] of Object.entries(this.props.cards)) {
      if (item.order % this.column === 0) {
        cards.push({...item, name});
      }
    }
    return cards.sort((a, b) => a.order - b.order);
  }

  resize = ((waitFlag = false) => (width, _, forceFlag = false) => {
    width = Math.max(0, Math.min(this.props.rootWidth, width));
    if (waitFlag && !forceFlag || width === this.state.rightSideWidth) {
      return;
    }
    this.setState({
      rightSideWidth: width
    }, () => {
      setTimeout(() => (waitFlag = false), 400);
    });
    waitFlag = true;
  })();

  handleVisibilityChanged = (name, visible) => {
    if (this.state.scrolledLeft === name && !visible) {
      // いま left が scroll している card が close した
      this.handleCardClosed(this.state.scrolledLeft, this.left);
    }
    if (this.state.scrolledRight === name && !visible) {
      // いま right が scroll している card が close した
      this.handleCardClosed(this.state.scrolledRight, this.right);
    }
  };

  handleCardClosed = (name, cards) => {
    const index = cards.findIndex(item => item.name === name);
    const next = cards[index - 1] || cards[index + 1];
    if (next) {
      this.scrollToCard(next.name);
    }
  };

  renderCards(cards) {
    return cards.map((info, key) => {
      return React.createElement(Cards[info.name], {
        key,
        cardPropsBag: {
          name: info.name,
          visible: info.visible,
          isResizing: this.state.isResizing,
          updateCard: this.props.updateCard,
          scrollToCard: this.scrollToCard,
          cards: this.props.cards,
        },
        ...this.props.cardProps[info.name]
      });
    });
  }

  renderIcons(styles) {
    if (!this.props.showCardIcon) {
      return null;
    }
    const cards = [];
    for (const [name, item] of Object.entries(this.props.cards)) {
      if (item.visible) {
        cards.push({...item, name});
      }
    }
    cards.sort((a, b) => a.order - b.order);
    return cards.map((item, key) => (
      <FloatingActionButton mini
        key={key}
        href={'#' + item.name}
        style={styles.icon(item.order % this.column === 1)}
      >
        {Cards[item.name].icon && Cards[item.name].icon()}
      </FloatingActionButton>
    ));
  }

  render() {
    const {connectDropTarget} = this.props;

    const isShrinkLeft = (yes, no) => {
      if (this.column === 1) {
        return yes;
      }
      return no;
    };
    const isShrinkRight = (yes, no) => no;
    const isResizing = (yes, no) => this.state.isResizing ? yes : no;

    // (暫定) 背景画像
    const bg =
      this.props.findFile('feeles/background.png') ||
      this.props.findFile('feeles/background.jpg');

    const styles = {
      container: {
        flex: '1 1 auto',
        display: 'flex',
        alignItems: 'stretch',
        height: 0,
        overflow: 'hidden',
        backgroundImage: bg && `url(${bg.blobURL})`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        backgroundSize: 'contain',
        position: 'relative',
      },
      left: {
        position: 'relative',
        flex: isShrinkLeft('0 0 auto', '1 1 auto'),
        width: 0,
        paddingRight: 4,
        marginLeft: -12,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        overflow: 'hidden',
        direction: 'rtl'
      },
      right: {
        position: 'relative',
        flex: isShrinkLeft('1 1 auto', '0 0 auto'),
        width: isShrinkRight(0, this.state.rightSideWidth),
        paddingLeft: 4,
        marginRight: -12,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        overflow: 'hidden',
      },
      dropCover: {
        position: 'absolute',
        top: 0,
        left: 0,
        opacity: isResizing(0.5, 0),
        width: '100%',
        height: '100%',
        backgroundColor: 'black',
        zIndex: isResizing(1000, 0),
        transition: transitions.easeOut(null, 'opacity')
      },
      blank: {
        flex: '0 0 1000px'
      },
      bar: {
        width: 0,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-around',
        overflow: 'visible',
        alignItems: 'center',
        zIndex: 2,
      },
      icon(isLeft) {
        return {
          marginRight: isLeft ? 0 : -2 * SizerWidth,
        };
      },
    };

    return connectDropTarget(
      <div style={styles.container}>
        <div style={styles.dropCover}></div>
        <div id={LeftContainerId} style={styles.left}>
          {this.renderCards(this.left)}
          <div style={styles.blank}></div>
        </div>
        <div style={styles.bar}>
          {this.renderIcons(styles)}
        </div>
        {this.column === 2
          ? (<Sizer width={this.state.rightSideWidth} onSizer={(isResizing) => this.setState({isResizing})}/>)
          : null}
        <div id={RightContainerId} style={styles.right}>
          {this.renderCards(this.right)}
          <div style={styles.blank}></div>
        </div>
      </div>
    );
  }
}

const spec = {
  drop(props, monitor, component) {
    const offset = monitor.getDifferenceFromInitialOffset();
    const init = monitor.getItem();
    component.resize(init.width - offset.x, init.height + offset.y, true);
    return {};
  },
  hover(props, monitor, component) {
    const offset = monitor.getDifferenceFromInitialOffset();
    if (offset) {
      const init = monitor.getItem();
      component.resize(init.width - offset.x, init.height + offset.y);
    }
  }
};

const collect = (connect, monitor) => ({connectDropTarget: connect.dropTarget()});

export default DropTarget(DragTypes.Sizer, spec, collect)(CardContainer);
