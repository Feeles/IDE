import { grey100, grey300, blueA700 } from 'material-ui/styles/colors';
import { fade } from 'material-ui/utils/colorManipulator';

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
  background-color: ${grey100};
  transition: ${transitions.easeOut()};
}
.CodeMirror-gutters {
  border-color: ${palette.primary1Color} !important;
}
.CodeMirror-hints {
  z-index: 1000;
}
.Feeles-asset-opener {
  width: 568px;
  margin: -24px 0 0 -4px;
  box-sizing: border-box;
  padding: 0 20px;
  z-index: 2;
}
.Feeles-asset-opener .Feeles-asset-opener-begin,
.Feeles-asset-opener .Feeles-asset-opener-end {
  display: inline-block;
  box-sizing: border-box;
  width: 100%;
  text-align: center;
  cursor: pointer;
  color: ${palette.alternateTextColor};
  background-color: ${fade(palette.primary1Color, 1)};
  padding: 6px 40px 6px 5px;
  border-radius: 2px;
  white-space: pre;
  box-shadow: ${paper.zDepthShadows[1]};
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
  padding: 1px 2px 1px 4px;
  color: transparent;
  box-shadow: 0 0 0 100em ${palette.primary1Color};
}
div.CodeMirror.CodeMirror-focused .Feeles-asset-opener,
div.CodeMirror.CodeMirror-focused .Feeles-asset,
div.CodeMirror.CodeMirror-focused .Feeles-dropdown-button {
  opacity: 0.9;
}
.cm-s-default .cm-property {
  color: ${blueA700};
}
div.CodeMirror:not(.CodeMirror-focused) pre>span {
  background-color: ${grey300};
}
div.CodeMirror:not(.CodeMirror-focused) pre>span>span.cm-tab,
div.CodeMirror:not(.CodeMirror-focused) pre>span>span.cm-comment {
  background-color: ${grey100};
}
div.CodeMirror span.CodeMirror-matchingbracket {
  font-size: 30px;
  line-height: 16px;
  vertical-align: middle;
}
div.CodeMirror.CodeMirror-focused pre>span>span.cm-comment {
  opacity: 0.5;
}
div.CodeMirror pre {
  line-height: 20px;
}`;
