import React, { PureComponent } from 'react';
import { withTheme } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import { style } from 'typestyle';
import Button from '@material-ui/core/Button';
import NavigationExpandLess from '@material-ui/icons/ExpandLess';
import { fade } from '@material-ui/core/styles/colorManipulator';
import { emphasize } from '@material-ui/core/styles/colorManipulator';

import AssetButton from './AssetButton';

const cn = {
  label: style({
    flex: '0 0 100%',
    color: 'white',
    textAlign: 'center',
    marginTop: 16,
    fontWeight: 600
  }),
  wrapper: style({
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center'
  }),
  closeButton: style({
    position: 'absolute',
    bottom: 8,
    right: 8
  })
};
const getCn = props => ({
  root: style({
    position: 'absolute',
    width: '100%',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 10,
    height: props.open ? '100%' : 0,
    transition: props.theme.transitions.create()
  }),
  scroller: style({
    flex: 1,
    overflowX: 'auto',
    overflowY: 'scroll',
    boxSizing: 'border-box',
    paddingBottom: 60,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    backgroundColor: fade(
      emphasize(props.theme.palette.background.paper, 0.75),
      0.55
    )
  })
});

@withTheme()
export default class AssetPane extends PureComponent {
  static propTypes = {
    theme: PropTypes.object.isRequired,
    fileView: PropTypes.object.isRequired,
    open: PropTypes.bool.isRequired,
    scope: PropTypes.string,
    loadConfig: PropTypes.func.isRequired,
    handleClose: PropTypes.func.isRequired,
    handleAssetInsert: PropTypes.func.isRequired,
    findFile: PropTypes.func.isRequired,
    localization: PropTypes.object.isRequired
  };

  state = {
    assets: {}
  };

  componentDidMount() {
    this.setState({
      assets: this.props.loadConfig('asset')
    });
  }

  componentDidUpdate(prevProps) {
    if (prevProps.fileView !== this.props.fileView) {
      this.setState({
        assets: this.props.loadConfig('asset')
      });
    }
  }

  renderEachLabel(label) {
    const items = this.state.assets[label];
    if (!items) return null;

    return (
      <div key={label} className={cn.wrapper}>
        <div className={cn.label}>{label}</div>
        {items.map((item, i) => (
          <AssetButton
            {...item}
            key={i}
            onClick={this.props.handleAssetInsert}
            findFile={this.props.findFile}
            localization={this.props.localization}
          />
        ))}
      </div>
    );
  }

  render() {
    const dcn = getCn(this.props);
    const { scope } = this.props;

    // e.g. scope === 'モンスター アイテム'
    const labels = scope ? scope.trim().split(' ') : [];

    return (
      <div className={dcn.root}>
        <div className={dcn.scroller}>
          {labels.map(label => this.renderEachLabel(label))}
        </div>
        <Button
          color="primary"
          variant="fab"
          aria-label="Close"
          className={cn.closeButton}
          onClick={this.props.handleClose}
        >
          <NavigationExpandLess />
        </Button>
      </div>
    );
  }
}
