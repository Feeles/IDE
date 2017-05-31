import { grey100, grey300, blueA700 } from 'material-ui/styles/colors';
import transitions from 'material-ui/styles/transitions';
import { fade } from 'material-ui/utils/colorManipulator';

export default ({ palette, paper }) =>
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
  width: 100%;
  margin: -24px 0 0 -4px;
  box-sizing: border-box;
  padding: 0 20px;
  z-index: 2;
}
div.CodeMirror.CodeMirror-focused .Feeles-asset-opener {
  opacity: 0.9;
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
