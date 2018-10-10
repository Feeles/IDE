import {
  grey100,
  grey200,
  grey300,
  grey400,
  grey500,
  grey600,
  blueA700
} from '@material-ui/core/styles/colors';
import { fade } from '@material-ui/core/styles/colorManipulator';

export default ({ palette, paper, transitions }) =>
  `
textarea {
  font-size: 16px !important; /* In smartphone, will not scale automatically */
}
.CodeMirror {
  position: absolute;
  font-family: Consolas, "Liberation Mono", Menlo, Courier, monospace;
  width: 100%;
  height: 100%;
  transition: ${transitions.easeOut()};
}
.CodeMirror-gutters {
  border-color: ${palette.primary1Color} !important;
}
.CodeMirror-hints {
  z-index: 1000;
}
.Feeles-asset {
  transform: translateY(-22px);
  height: 0;
  white-space: pre;
  z-index: 2;
}
.Feeles-asset .Feeles-asset-button {
  display: inline-block;
  padding: 4px 0;
  border-radius: 2px;
  cursor: pointer;
  color: ${palette.alternateTextColor};
  background-color: ${fade(palette.primary1Color, 1)};
  box-shadow: ${paper.zDepthShadows[1]};
}
.Feeles-asset .Feeles-asset-blank {
  display: inline-block;
  transform: scaleY(0);
}
.Feeles-dropdown {
  transform: translateY(-20px);
  height: 0;
  white-space: pre;
  z-index: 3;
}
.Feeles-dropdown .Feeles-dropdown-shadow {
  transform: translateX(-20px);
  display: inline-block;
  border-radius: 2px;
  box-shadow: ${paper.zDepthShadows[1]};
  height: 20px; /* TODO: Flexible font-size */
}
.Feeles-dropdown .Feeles-dropdown-button {
  display: inline-block;
  padding: 2px 10px 2px 20px;
  border-radius: 2px;
  overflow: hidden;
  cursor: pointer;
}
.Feeles-dropdown .Feeles-dropdown-blank {
  display: inline-block;
  transform: scaleY(0);
}
.Feeles-dropdown .Feeles-dropdown-label {
  display: inline-block;
  position: relative;
  color: ${palette.alternateTextColor};
  z-index: 1;
  pointer-events: none;
}
.Feeles-dropdown .Feeles-dropdown-value {
  display: inline-block;
  border-radius: 2px;
  margin: -1px -2px -1px -4px;
  padding: 0px 2px 0px 4px;
  color: transparent;
  /* CSS hacking */
  box-shadow: 0 0 0 100em ${palette.primary1Color};
  filter: drop-shadow(0 0 30px transparent);
}
div.CodeMirror.CodeMirror-focused .Feeles-asset,
div.CodeMirror.CodeMirror-focused .Feeles-dropdown-button {
  opacity: 0.9;
}
a.Feeles-link {
  display: inline-block;
  position: absolute;
  white-space: pre;
  z-index: 3;
}
.cm-s-default .cm-property {
  color: ${blueA700};
}

.cm-tab {
  background-color: ${grey100};
  opacity: 0.8;
}
.cm-tab + .cm-tab {
  background-color: ${grey200};
}
.cm-tab + .cm-tab + .cm-tab {
  background-color: ${grey300};
}
.cm-tab + .cm-tab + .cm-tab + .cm-tab {
  background-color: ${grey400};
}
.cm-tab + .cm-tab + .cm-tab + .cm-tab + .cm-tab {
  background-color: ${grey500};
}
.cm-tab + .cm-tab + .cm-tab + .cm-tab + .cm-tab + .cm-tab {
  background-color: ${grey600};
}
div.CodeMirror span.CodeMirror-matchingbracket {
  text-shadow: 0 0 4px #000, 0 -8px 10px #000, 0 8px 10px #000;
}
div.CodeMirror.CodeMirror-focused pre>span>span.cm-comment {
  opacity: 0.5;
}
div.CodeMirror pre {
  line-height: 20px;
}`;
