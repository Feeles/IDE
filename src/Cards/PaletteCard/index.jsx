import React, { PureComponent } from 'react';
import { withTheme } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import { style } from 'typestyle';
import Card from '../CardWindow';
import CardActions from '@material-ui/core/CardActions';
import Popover from '@material-ui/core/Popover';
import Paper from '@material-ui/core/Paper';
import { convertColorToString } from '@material-ui/core/styles/colorManipulator';
import { ChromePicker, TwitterPicker } from 'react-color';

import LayeredStyle from './LayeredStyle';

const boxSize = 60;

const getCn = props => ({
  canvas: style({
    display: 'flex',
    alignItems: 'center',
    height: boxSize + 32,
    backgroundColor: props.theme.palette.background.paper
  }),
  primary: style({
    flex: '1 1 auto',
    marginLeft: props.theme.spacing.unit * 3,
    height: boxSize,
    backgroundColor: props.theme.palette.primary.main
  }),
  secondary: style({
    flex: '1 1 auto',
    marginLeft: props.theme.spacing.unit * 3,
    height: boxSize * 0.8,
    backgroundColor: props.theme.palette.secondary.main
  }),
  blank: style({
    flex: '1 1 auto',
    backgroundColor: 'transparent',
    marginLeft: props.theme.spacing.unit * 3,
    height: boxSize
  })
});

@withTheme()
export default class PaletteCard extends PureComponent {
  static propTypes = {
    theme: PropTypes.object.isRequired,
    cardPropsBag: PropTypes.object.isRequired,
    localization: PropTypes.object.isRequired,
    getConfig: PropTypes.func.isRequired,
    setConfig: PropTypes.func.isRequired
  };

  state = {
    palette: this.props.getConfig('palette'),
    open: false,
    key: null,
    anchorEl: null,
    limited: false
  };

  handleRectClick = (event, key, limited = false) => {
    event.stopPropagation();
    const anchorEl = event.target;
    const color = this.state.palette[key];
    this.setState({ open: true, key, anchorEl, color, limited });
  };

  handleChangeComplete = structure => {
    const { key } = this.state;
    const { setConfig } = this.props;

    const { r, g, b, a } = structure.rgb;
    const color = {
      type: 'rgba',
      values: [r, g, b, a]
    };

    const palette = Object.assign({}, this.state.palette, {
      [key]: convertColorToString(color)
    });
    setConfig('palette', palette)
      .then(file => file.json)
      .then(palette => this.setState({ palette }));
  };

  closePopover = () => {
    this.setState({ open: false });
  };

  render() {
    const dcn = getCn(this.props);
    const { open, key, anchorEl, limited } = this.state;
    const { palette, spacing } = this.props.theme;

    const bodyColor = getComputedStyle(document.body)['background-color'];

    return (
      <Card
        icon={this.props.localization.paletteCard.title}
        {...this.props.cardPropsBag}
      >
        <CardActions>
          <LayeredStyle
            styles={[
              {
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: 'white'
              },
              {
                backgroundColor: bodyColor
              },
              {
                padding: spacing.unit * 3
              }
            ]}
            onClick={e => this.handleRectClick(e, 'backgroundColor')}
          >
            <Paper
              className={dcn.canvas}
              onClick={e => this.handleRectClick(e, 'canvasColor')}
            >
              <Paper
                className={dcn.primary}
                onClick={e => this.handleRectClick(e, 'primary1Color', true)}
              />
              <Paper
                className={dcn.secondary}
                onClick={e => this.handleRectClick(e, 'accent1Color', true)}
              />
              <div className={dcn.blank} />
            </Paper>
          </LayeredStyle>
        </CardActions>
        <Popover
          open={open}
          anchorEl={anchorEl}
          anchorOrigin={{
            horizontal: 'left',
            vertical: 'top'
          }}
          targetOrigin={{
            horizontal: 'left',
            vertical: 'bottom'
          }}
          onClose={this.closePopover}
        >
          {limited ? (
            <TwitterPicker
              color={key && palette[key]}
              onChangeComplete={this.handleChangeComplete}
            />
          ) : (
            <ChromePicker
              color={key && palette[key]}
              onChangeComplete={this.handleChangeComplete}
            />
          )}
        </Popover>
      </Card>
    );
  }
}
