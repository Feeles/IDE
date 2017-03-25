import React, {PureComponent, PropTypes} from 'react';
import {Events, scroller} from 'react-scroll';
import {DropTarget} from 'react-dnd';
import transitions from 'material-ui/styles/transitions';

import Sizer from './Sizer';
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
    rightSideWidth: this.props.rootWidth / 2
  };

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
      const containerId = card.order % this.column === 1
        ? LeftContainerId
        : RightContainerId;
      scroller.scrollTo(name, {
        containerId,
        smooth: true,
        duration: 250,
      });
      location.hash = '';
    }
  };

  get column() {
    return 1 + (this.props.rootWidth > 991);
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

  renderIcons(cards) {
    if (!this.props.showCardIcon) {
      return null;
    }
    cards = cards.filter(info => info.visible);
    return cards.map((info, key) => (
      <a key={key} href={'#' + info.name}>
        {Cards[info.name].icon && Cards[info.name].icon()}
      </a>
    ));
  }

  render() {
    const {connectDropTarget} = this.props;

    const orderedCardInfo = Object.entries(this.props.cards).map(([name, value]) => ({
      name,
      ...value
    }));
    orderedCardInfo.sort((a, b) => a.order - b.order);

    const left = orderedCardInfo.filter(item => {
      return item.order % this.column === 1;
    });
    const right = orderedCardInfo.filter(item => {
      return item.order % this.column === 0;
    });

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
        zIndex: 3,
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
        zIndex: 3,
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
        zIndex: 2,
      }
    };

    return connectDropTarget(
      <div style={styles.container}>
        <div style={styles.dropCover}></div>
        <div id={LeftContainerId} style={styles.left}>
          {this.renderCards(left)}
          <div style={styles.blank}></div>
        </div>
        <div style={{...styles.bar, alignItems: 'flex-end'}}>
          {this.renderIcons(left)}
        </div>
        {this.column === 2
          ? (<Sizer width={this.state.rightSideWidth} onSizer={(isResizing) => this.setState({isResizing})}/>)
          : null}
        <div style={{...styles.bar, alignItems: 'flex-start'}}>
          {this.renderIcons(right)}
        </div>
        <div id={RightContainerId} style={styles.right}>
          {this.renderCards(right)}
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
