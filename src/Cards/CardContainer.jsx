import React, {PureComponent, PropTypes} from 'react';
import {DropTarget} from 'react-dnd';
import transitions from 'material-ui/styles/transitions';

import Sizer from './Sizer';
import DragTypes from '../utils/dragTypes';
import * as Cards from './';

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

    const orderedCardInfo = Object.entries(this.props.getConfig('card'))
      .map(([name, value]) => ({name, ...value}));
    orderedCardInfo.sort((a, b) => a.order - b.order);

    const column = 1 + (this.props.rootWidth > 991);

    const left = orderedCardInfo.filter(item => {
      return item.order % column === 1;
    });
    const right = orderedCardInfo.filter(item => {
      return item.order % column === 0;
    });

    const isShrinkLeft = (yes, no) => {
      if (column === 1) {
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
        flex: isShrinkLeft('0 0 auto', '1 1 auto'),
        width: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        overflow: 'scroll',
        paddingBottom: 200,
        zIndex: 1,
      },
      right: {
        flex: isShrinkLeft('1 1 auto', '0 0 auto'),
        boxSizing: 'border-box',
        width: isShrinkRight(0, this.state.rightSideWidth),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        overflow: 'scroll',
        paddingBottom: 200,
        zIndex: 1,
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
        <div style={styles.left}>
          <div>
            {this.renderCards(left)}
          </div>
        </div>
        {column === 2
          ? (<Sizer width={this.state.rightSideWidth} onSizer={(isResizing) => this.setState({isResizing})}/>)
          : null}
        <div style={styles.right}>
          <div>
            {this.renderCards(right)}
          </div>
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
