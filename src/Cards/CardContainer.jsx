import React, {PureComponent, PropTypes} from 'react';
import {scroller} from 'react-scroll';
import {DropTarget} from 'react-dnd';
import transitions from 'material-ui/styles/transitions';

import Sizer from './Sizer';
import DragTypes from '../utils/dragTypes';
import * as Cards from './';

const LeftContainerId = 'CardContainerLeft';
const RightContainerId = 'CardContainerRight';

class CardContainer extends PureComponent {

  static propTypes = {
    getConfig: PropTypes.func.isRequired,
    rootWidth: PropTypes.number.isRequired,
    cardProps: PropTypes.object.isRequired,
    updateCard: PropTypes.func.isRequired,
    localization: PropTypes.object.isRequired,

    connectDropTarget: PropTypes.func.isRequired
  };

  state = {
    isResizing: false,
    rightSideWidth: this.props.rootWidth / 2
  };

  componentDidMount() {
    window.addEventListener('hashchange', this.handleHashChange);
  }

  componentWillUnmount() {
    window.removeEventListener('hashchange', this.handleHashChange);
  }

  handleHashChange = () => {
    if (!location.hash) return;
    const name = location.hash.substr(1);
    const card = this.props.getConfig('card')[name];
    if (card) {
      const containerId = card.order % this.column === 1
        ? LeftContainerId
        : RightContainerId;
      scroller.scrollTo(name, {
        containerId,
        smooth: true,
        ignoreCancelEvents: true,
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
          ...info,
          isResizing: this.state.isResizing,
          localization: this.props.localization,
          updateCard: this.props.updateCard,
        },
        ...this.props.cardProps[info.name]
      });
    });
  }

  render() {
    const {connectDropTarget} = this.props;

    const orderedCardInfo = Object.entries(this.props.getConfig('card')).map(([name, value]) => ({
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
    const isResizing = (yes, no) => this.state.isResizing
      ? yes
      : no;

    const styles = {
      container: {
        flex: '1 1 auto',
        display: 'flex',
        alignItems: 'stretch'
      },
      left: {
        position: 'relative',
        flex: isShrinkLeft('0 0 auto', '1 1 auto'),
        width: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        overflow: 'scroll',
        zIndex: 1
      },
      right: {
        position: 'relative',
        flex: isShrinkLeft('1 1 auto', '0 0 auto'),
        width: isShrinkRight(0, this.state.rightSideWidth),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        overflow: 'scroll',
        zIndex: 1
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
      }
    };

    return connectDropTarget(
      <div style={styles.container}>
        <div style={styles.dropCover}></div>
        <div id={LeftContainerId} style={styles.left}>
          {this.renderCards(left)}
          <div style={{
            flex: '0 0 1000px'
          }}></div>
        </div>
        {this.column === 2
          ? (<Sizer width={this.state.rightSideWidth} onSizer={(isResizing) => this.setState({isResizing})}/>)
          : null}
        <div id={RightContainerId} style={styles.right}>
          {this.renderCards(right)}
          <div style={{
            flex: '0 0 1000px'
          }}></div>
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
