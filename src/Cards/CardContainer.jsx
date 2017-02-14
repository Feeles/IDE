import React, {PureComponent, PropTypes} from 'react';
import {DropTarget} from 'react-dnd';
import transitions from 'material-ui/styles/transitions';

import Sizer from './Sizer';
import DragTypes from '../utils/dragTypes';
import * as Cards from './';

class CardContainer extends PureComponent {

  static propTypes = {
    cards: PropTypes.array.isRequired,
    rootWidth: PropTypes.number.isRequired,
    cardProps: PropTypes.object.isRequired,

    connectDropTarget: PropTypes.func.isRequired
  };

  state = {
    column: 2,
    isResizing: false,
    rightSideWidth: this.props.rootWidth / 2
  };

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

  render() {
    const {connectDropTarget, cards} = this.props;

    const orderedCardInfo = [...this.props.cards];
    orderedCardInfo.sort((a, b) => a.order - b.order);

    const left = orderedCardInfo.filter(item => {
      return item.visible && item.order % this.state.column === 1;
    });
    const right = orderedCardInfo.filter(item => {
      return item.visible && item.order % this.state.column === 0;
    });
    const hidden = orderedCardInfo.filter(item => item.visible === false);

    const renderCards = (cards) => cards.map((info, key) => {
      return React.createElement(Cards[info.name], {
        key,
        cardPropsBag: {
          ...this.props.cardPropsBag,
          name: info.name,
          isResizing: this.state.isResizing
        },
        ...this.props.cardProps[info.name]
      });
    });

    const shrinkLeft = false;
    const shrinkRight = false;
    const isResizing = (yes, no) => this.state.isResizing ? yes : no;

    const styles = {
      container: {
        flex: '1 1 auto',
        display: 'flex',
        alignItems: 'stretch'
      },
      left: {
        flex: shrinkLeft
          ? '0 0 auto'
          : '1 1 auto',
        width: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        overflow: 'scroll',
        paddingBottom: 200
      },
      right: {
        flex: shrinkLeft
          ? '1 1 auto'
          : '0 0 auto',
        boxSizing: 'border-box',
        width: shrinkRight
          ? 0
          : this.state.rightSideWidth,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        overflow: 'scroll',
        paddingBottom: 200
      },
      dropCover: {
        position: 'absolute',
        top: isResizing(0, '50%'),
        left: isResizing(0, '50%'),
        opacity: isResizing(0.5, 0),
        width: isResizing('100%', 0),
        height: isResizing('100%', 0),
        backgroundColor: 'black',
        zIndex: 1000,
        transition: transitions.easeOut()
      }
    };

    return connectDropTarget(
      <div style={styles.container}>
        <div style={styles.dropCover}></div>
        <div style={styles.left}>
          <div>
            {renderCards(left)}
          </div>
        </div>
        <Sizer width={this.state.rightSideWidth} onSizer={(isResizing) => this.setState({isResizing})}/>
        <div style={styles.right}>
          <div>
            {renderCards(right)}
          </div>
        </div>
        {renderCards(hidden)}
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
