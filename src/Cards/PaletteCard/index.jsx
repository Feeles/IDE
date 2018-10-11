import React, { PureComponent } from 'react';
import { withTheme } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import Card from '../CardWindow';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Popover from '@material-ui/core/Popover';
import Paper from '@material-ui/core/Paper';
import { convertColorToString } from '@material-ui/core/styles/colorManipulator';
import { ChromePicker, TwitterPicker } from 'react-color';

import LayeredStyle from './LayeredStyle';

const getStyles = props => {
  const { palette, spacing } = props.theme;

  const bodyColor = getComputedStyle(document.body)['background-color'];
  const boxSize = 60;

  return {
    html: {
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: 'white'
    },
    body: {
      backgroundColor: bodyColor
    },
    overlay: {
      padding: spacing.unit * 3
    },
    canvas: {
      display: 'flex',
      alignItems: 'center',
      height: boxSize + 32,
      backgroundColor: palette.background.paper
    },
    primary: {
      flex: '1 1 auto',
      marginLeft: spacing.unit * 3,
      height: boxSize,
      backgroundColor: palette.primary.main
    },
    secondary: {
      flex: '1 1 auto',
      marginLeft: spacing.unit * 3,
      height: boxSize * 0.8,
      backgroundColor: palette.secondary.main
    },
    blank: {
      flex: '1 1 auto',
      marginLeft: spacing.unit * 3,
      height: boxSize,
      backgroundColor: 'transparent'
    },
    container: {
      textAlign: 'center',
      overflow: 'hidden'
    },
    item: {
      flex: '0 0 auto',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      maxWidth: 200,
      margin: `${spacing.unit}px auto`
    },
    label: {
      color: palette.text.primary
    },
    rect: {
      boxSizing: 'border-box',
      marginLeft: spacing.unit * 3,
      padding: '.5rem',
      border: `1px solid ${palette.text.primary}`
    }
  };
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

  renderItem(key, styles) {
    const { palette } = this.props.theme;

    const rectStyle = Object.assign({}, styles.rect, {
      backgroundColor: palette[key]
    });

    return (
      <div key={key} style={styles.item}>
        <span style={styles.label}>{key}</span>
        <span
          style={rectStyle}
          onClick={event => this.handleRectClick(event, key)}
        />
      </div>
    );
  }

  render() {
    const { open, key, anchorEl, limited } = this.state;
    const { palette } = this.props.theme;

    const styles = getStyles(this.props, this.context);

    return (
      <Card
        icon={this.props.localization.paletteCard.title}
        {...this.props.cardPropsBag}
      >
        <CardActions>
          <LayeredStyle
            styles={[styles.html, styles.body, styles.overlay]}
            onClick={e => this.handleRectClick(e, 'backgroundColor')}
          >
            <Paper
              style={styles.canvas}
              onClick={e => this.handleRectClick(e, 'canvasColor')}
            >
              <Paper
                style={styles.primary}
                onClick={e => this.handleRectClick(e, 'primary1Color', true)}
              />
              <Paper
                style={styles.secondary}
                onClick={e => this.handleRectClick(e, 'accent1Color', true)}
              />
              <div style={styles.blank} />
            </Paper>
          </LayeredStyle>
        </CardActions>
        <CardContent style={styles.container}>
          {Object.keys(palette).map(key => this.renderItem(key, styles))}
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
