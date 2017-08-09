import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import NavigationExpandLess from 'material-ui/svg-icons/navigation/expand-less';

import AssetButton from './AssetButton';

export default class AssetPane extends PureComponent {
  static propTypes = {
    open: PropTypes.bool.isRequired,
    scope: PropTypes.string,
    loadConfig: PropTypes.func.isRequired,
    handleClose: PropTypes.func.isRequired,
    handleAssetInsert: PropTypes.func.isRequired,
    files: PropTypes.array.isRequired,
    findFile: PropTypes.func.isRequired,
    localization: PropTypes.object.isRequired,
    styles: PropTypes.object.isRequired
  };

  state = {
    assets: {}
  };

  componentWillMount() {
    this.setState({
      assets: this.props.loadConfig('asset')
    });
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.files !== nextProps.files) {
      this.setState({
        assets: this.props.loadConfig('asset')
      });
    }
  }

  renderEachLabel(label, styles) {
    const items = this.state.assets[label];
    if (!items) return null;

    return (
      <div key={label} style={{ ...styles.wrapper }}>
        <div style={{ ...styles.label }}>
          {label}
        </div>
        {items.map((item, i) =>
          <AssetButton
            {...item}
            key={i}
            onTouchTap={this.props.handleAssetInsert}
            findFile={this.props.findFile}
            localization={this.props.localization}
          />
        )}
      </div>
    );
  }

  render() {
    const styles = {
      root: {
        ...this.props.styles.assetContainer,
        height: this.props.open ? '100%' : 0
      },
      scroller: {
        ...this.props.styles.scroller
      },
      label: {
        flex: '0 0 100%',
        color: 'white',
        textAlign: 'center',
        marginTop: 16,
        fontWeight: 600
      },
      wrapper: {
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center'
      },
      close: {
        ...this.props.styles.closeAsset
      }
    };
    const { scope } = this.props;

    // e.g. scope === 'モンスター アイテム'
    const labels = scope ? scope.trim().split(' ') : [];

    return (
      <div style={styles.root}>
        <div style={styles.scroller}>
          {labels.map(label => this.renderEachLabel(label, styles))}
        </div>
        <div style={styles.close} onTouchTap={this.props.handleClose}>
          <NavigationExpandLess color="white" />
        </div>
      </div>
    );
  }
}
