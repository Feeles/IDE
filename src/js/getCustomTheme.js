import transitions from '@material-ui/core/styles/transitions';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import grey from '@material-ui/core/colors/grey';
import {
  fade,
  emphasize,
  recomposeColor,
  decomposeColor
} from '@material-ui/core/styles/colorManipulator';

// Twitter theme colors without 'ABB8C3' (Gray)
const themeColors = [
  '#FF6900',
  '#FCB900',
  '#7BDCB5',
  '#00D084',
  '#8ED1FC',
  '#0693E3',
  '#F78DA7',
  '#EB144C',
  '#9900EF'
];

export const defaultPalette = {
  canvasColor: '#ffffff',
  primary1Color: random(themeColors),
  accent1Color: random(themeColors),
  backgroundColor: grey['500']
};

export default feelesrc => {
  // Mui Theme (plain object)
  const theme = getMuiTheme({
    palette: getPalette(feelesrc.palette)
  });
  // 影の設定
  overrideShadow(theme, feelesrc.enableShadow);
  // トランジションの設定
  overrideTransition(theme, feelesrc.enableTransition);
  return theme;
};

function getPalette(palette = {}) {
  const { backgroundColor, canvasColor, primary1Color, accent1Color } = {
    // random palette
    ...defaultPalette,
    // feelesrc::palette
    ...palette
  };

  return {
    primary1Color,
    primary2Color: emphasize(primary1Color),
    primary3Color: monochrome(primary1Color),
    accent1Color,
    accent2Color: monochrome(accent1Color),
    accent3Color: emphasize(monochrome(accent1Color)),
    textColor: fade(emphasize(canvasColor, 1), 1),
    secondaryTextColor: fade(emphasize(canvasColor, 1), 0.54),
    alternateTextColor: fade(emphasize(emphasize(canvasColor, 1), 1), 1),
    canvasColor,
    borderColor: fade(accent1Color, 0.4),
    disabledColor: fade(emphasize(canvasColor, 1), 0.3),
    pickerHeaderColor: primary1Color,
    clockCircleColor: fade(emphasize(canvasColor, 1), 0.07),
    shadowColor: fade(emphasize(canvasColor, 1), 1),
    backgroundColor,
    ...palette
  };
}

function overrideShadow(theme, enableShadow = true) {
  if (!enableShadow) {
    // box-shadow: none
    theme.paper.zDepthShadows = theme.paper.zDepthShadows.map(() => 'none');
    theme.chip.shadow = 'none';
  }
}

function overrideTransition(theme, enableTransition = true) {
  if (enableTransition) {
    theme.transitions = transitions;
  } else {
    theme.transitions = {
      easeOut: () => 'none',
      create: () => 'none'
    };
  }
}

function monochrome(color) {
  color = decomposeColor(color);
  const [r, g, b] = color.values;
  const _ = r * 0.3 + g * 0.59 + b * 0.11;
  color = { type: 'rgb', values: [_, _, _] };
  return recomposeColor(color);
}

function random(colors) {
  const index = (Math.random() * colors.length) >> 0;
  return colors[index];
}
