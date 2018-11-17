import React, { PureComponent } from 'react';
import { withTheme } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import { style, classes } from 'typestyle';
import Button from '@material-ui/core/Button';
import ExpandMore from '@material-ui/icons/ExpandMore';
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
  closer: style({
    width: '100%'
  })
};
const getCn = props => ({
  root: style({
    display: 'flex',
    flexDirection: 'column'
  }),
  scroller: style({
    flex: 1,
    overflowX: 'auto',
    overflowY: 'scroll',
    boxSizing: 'border-box',
    paddingBottom: 24,
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
      <div className={classes(dcn.root, this.props.className)}>
        <Button
          variant="contained"
          aria-label="Close"
          className={cn.closer}
          onClick={this.props.handleClose}
        >
          <ExpandMore />
          とじる
        </Button>
        <div className={dcn.scroller}>
          {labels.map(label => this.renderEachLabel(label))}
        </div>
      </div>
    );
  }
}
