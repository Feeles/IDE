import { createMuiTheme } from '@material-ui/core/styles';
import red from '@material-ui/core/colors/red';
import * as themeColors from './colors';

export const defaultPalette = {
  type: 'light',
  primary: random(themeColors),
  accent: random(themeColors),
  error: red
};

export default feelesrc => {
  // Mui Theme (plain object)

  const theme = createMuiTheme({
    typography: {
      useNextVariants: true,
      button: {
        textTransform: 'none'
      }
    },

    // breakpoints: {},
    // direction: "ltr",
    // mixins: {},
    palette: {
      ...defaultPalette,
      ...feelesrc.palette
    },
    // props: {},
    // shadows: [],
    // typography: {},
    // shape: {},
    // spacing: {},
    transitions: {}
    // zIndex: {},
  });

  if (feelesrc.enableShadow === false) {
    // 影の無効化
    theme.shadows = Array.from({ length: 25 });
  }
  if (feelesrc.enableTransition === false) {
    // トランジションの無効化
    theme.transitions.easing.easeInOut = 'none';
    theme.transitions.easing.easeOut = 'none';
    theme.transitions.easing.easeIn = 'none';
    theme.transitions.easing.sharp = 'none';
  }

  return theme;
};

function random(colors) {
  const index = (Math.random() * Object.keys(colors).length) >> 0;
  const key = Object.keys(colors)[index];
  return colors[key];
}
