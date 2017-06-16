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

  render() {
    const styles = {
      root: {
        ...this.props.styles.assetContainer,
        height: this.props.open ? '100%' : 0
      },
      scroller: {
        ...this.props.styles.scroller
      },
      close: {
        ...this.props.styles.closeAsset
      }
    };

    const items = this.state.assets[this.props.scope] || [];

    return (
      <div style={styles.root}>
        <div style={styles.scroller}>
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
        <div style={styles.close} onTouchTap={this.props.handleClose}>
          <NavigationExpandLess color="white" />
        </div>
      </div>
    );
  }
}
