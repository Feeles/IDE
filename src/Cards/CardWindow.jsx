import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { style, classes } from 'typestyle';
import Card from '@material-ui/core/Card';

const HeaderHeight = 32;

const cn = {
  header: style({
    flex: 0,
    display: 'flex',
    alignItems: 'center',
    minHeight: HeaderHeight,
    paddingLeft: 8,
    width: '100%',
    boxSizing: 'border-box',
    overflowX: 'auto',
    overflowY: 'hidden'
  }),
  blank: style({
    flex: '1 1 auto'
  }),
  flex: style({
    display: 'flex'
  }),
  max: style({
    maxHeight: '100%'
  })
};
const getCn = props => ({
  root: style({
    position: 'relative',
    width: 0,
    order: props.order,
    boxSizing: 'border-box',
    maxWidth: '100%',
    maxHeight: '100%',
    height: '100%',
    direction: 'ltr',
    flex: '0 0 auto',
    flexBasis: props.visible ? '50%' : 0,
    padding: props.visible ? '16px 20px 16px 0' : 0,
    overflow: props.visible ? 'initial' : 'hidden'
  }),
  card: style({
    flex: 1
  }),
  innerContainer: style({
    position: 'relative',
    width: '100%',
    flexDirection: 'column'
  })
});

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
    const dcn = getCn(this.props);
    const { fit } = this.props;

    return (
      <div
        id={this.props.name}
        className={classes(dcn.root, fit ? cn.flex : cn.max)}
      >
        <Card
          {...this.cardProps}
          className={classes(dcn.card, fit ? cn.flex : cn.max)}
        >
          <div className={classes(dcn.innerContainer, fit ? cn.flex : cn.max)}>
            <div className={cn.header}>
              <span>{this.props.icon}</span>
              <div className={cn.blank} />
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
