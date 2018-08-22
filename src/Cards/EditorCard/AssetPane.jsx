import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import NavigationExpandLess from 'material-ui/svg-icons/navigation/expand-less';
import { fade } from 'material-ui/utils/colorManipulator';
import { emphasize } from 'material-ui/utils/colorManipulator';

import AssetButton from './AssetButton';

export default class AssetPane extends PureComponent {
  static propTypes = {
    fileView: PropTypes.object.isRequired,
    open: PropTypes.bool.isRequired,
    scope: PropTypes.string,
    loadConfig: PropTypes.func.isRequired,
    handleClose: PropTypes.func.isRequired,
    handleAssetInsert: PropTypes.func.isRequired,
    findFile: PropTypes.func.isRequired,
    localization: PropTypes.object.isRequired
  };

  static contextTypes = {
    muiTheme: PropTypes.object.isRequired
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

  renderEachLabel(label, styles) {
    const items = this.state.assets[label];
    if (!items) return null;

    return (
      <div key={label} style={{ ...styles.wrapper }}>
        <div style={{ ...styles.label }}>{label}</div>
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
    const { palette, transitions } = this.context.muiTheme;

    const styles = {
      root: {
        position: 'absolute',
        width: '100%',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 10,
        transition: transitions.easeOut(),
        height: open ? '100%' : 0
      },
      scroller: {
        flex: 1,
        overflowX: 'auto',
        overflowY: 'scroll',
        boxSizing: 'border-box',
        paddingBottom: 60,
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
        backgroundColor: fade(emphasize(palette.canvasColor, 0.75), 0.55)
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
        marginBottom: 10,
        textAlign: 'center',
        backgroundColor: palette.primary1Color,
        borderTopRightRadius: 0,
        borderTopLeftRadius: 0,
        cursor: 'pointer',
        height: open ? null : 0
      }
    };

    // e.g. scope === 'モンスター アイテム'
    const labels = scope ? scope.trim().split(' ') : [];

    return (
      <div style={styles.root}>
        <div style={styles.scroller}>
          {labels.map(label => this.renderEachLabel(label, styles))}
        </div>
        <div style={styles.close} onClick={this.props.handleClose}>
          <NavigationExpandLess color="white" />
        </div>
      </div>
    );
  }
}
