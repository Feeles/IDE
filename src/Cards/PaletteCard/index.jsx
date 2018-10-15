import React, { PureComponent } from 'react';
import { withTheme } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import { style } from 'typestyle';
import Card from '../CardWindow';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Popover from '@material-ui/core/Popover';
import Paper from '@material-ui/core/Paper';
import { convertColorToString } from '@material-ui/core/styles/colorManipulator';
import { ChromePicker, TwitterPicker } from 'react-color';

import LayeredStyle from './LayeredStyle';

const cn = {
  canvas: style({
    display: 'flex',
    alignItems: 'center'
  }),
  primary: style({
    flex: '1 1 auto'
  }),
  secondary: style({
    flex: '1 1 auto'
  }),
  blank: style({
    flex: '1 1 auto',
    backgroundColor: 'transparent'
  }),
  container: style({
    textAlign: 'center',
    overflow: 'hidden'
  }),
  item: style({
    flex: '0 0 auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    maxWidth: 200
  })
};

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

  renderItem(key) {
    const { palette, spacing } = this.props.theme;

    const rectStyle = Object.assign(
      {
        marginLeft: spacing.unit * 3,
        border: `1px solid ${palette.text.primary}`,

        boxSizing: 'border-box',
        padding: '.5rem'
      },
      {
        backgroundColor: palette[key]
      }
    );

    return (
      <div
        key={key}
        style={{
          margin: `${spacing.unit}px auto`
        }}
      >
        <span
          style={{
            color: palette.text.primary
          }}
        >
          {key}
        </span>
        <span
          style={rectStyle}
          onClick={event => this.handleRectClick(event, key)}
        />
      </div>
    );
  }

  render() {
    const { open, key, anchorEl, limited } = this.state;
    const { palette, spacing } = this.props.theme;

    const bodyColor = getComputedStyle(document.body)['background-color'];
    const boxSize = 60;

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
              className={cn.canvas}
              style={{
                height: boxSize + 32,
                backgroundColor: palette.background.paper
              }}
              onClick={e => this.handleRectClick(e, 'canvasColor')}
            >
              <Paper
                className={cn.primary}
                style={{
                  marginLeft: spacing.unit * 3,
                  height: boxSize,
                  backgroundColor: palette.primary.main
                }}
                onClick={e => this.handleRectClick(e, 'primary1Color', true)}
              />
              <Paper
                className={cn.secondary}
                style={{
                  marginLeft: spacing.unit * 3,
                  height: boxSize * 0.8,
                  backgroundColor: palette.secondary.main
                }}
                onClick={e => this.handleRectClick(e, 'accent1Color', true)}
              />
              <div
                className={cn.blank}
                style={{
                  marginLeft: spacing.unit * 3,
                  height: boxSize
                }}
              />
            </Paper>
          </LayeredStyle>
        </CardActions>
        <CardContent className={cn.container}>
          {Object.keys(palette).map(key => this.renderItem(key))}
        </CardContent>
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
