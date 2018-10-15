import React, { PureComponent } from 'react';
import { withTheme } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import { style } from 'typestyle';
import NavigationExpandLess from '@material-ui/icons/ExpandLess';
import { fade } from '@material-ui/core/styles/colorManipulator';
import { emphasize } from '@material-ui/core/styles/colorManipulator';

import AssetButton from './AssetButton';

const cn = {
  root: style({
    position: 'absolute',
    width: '100%',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 10
  }),
  scroller: style({
    flex: 1,
    overflowX: 'auto',
    overflowY: 'scroll',
    boxSizing: 'border-box',
    paddingBottom: 60,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0
  }),
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
  close: style({
    marginBottom: 10,
    textAlign: 'center',
    borderTopRightRadius: 0,
    borderTopLeftRadius: 0,
    cursor: 'pointer'
  })
};

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
      <div key={label} style={{ ...cn.wrapper }}>
        <div style={{ ...cn.label }}>{label}</div>
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
    const { scope, open } = this.props;
    const { palette, transitions } = this.props.theme;

    // e.g. scope === 'モンスター アイテム'
    const labels = scope ? scope.trim().split(' ') : [];

    return (
      <div
        className={cn.root}
        style={{
          height: open ? '100%' : 0,
          transition: transitions.create()
        }}
      >
        <div
          className={cn.scroller}
          style={{
            backgroundColor: fade(
              emphasize(palette.background.paper, 0.75),
              0.55
            )
          }}
        >
          {labels.map(label => this.renderEachLabel(label))}
        </div>
        <div
          className={cn.close}
          style={{
            backgroundColor: palette.primary.main,
            height: open ? null : 0
          }}
          onClick={this.props.handleClose}
        >
          <NavigationExpandLess style={{ color: 'white' }} />
        </div>
      </div>
    );
  }
}
