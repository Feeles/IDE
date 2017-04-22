import { grey100, grey300, blueA700 } from 'material-ui/styles/colors';
import transitions from 'material-ui/styles/transitions';
import { fade } from 'material-ui/utils/colorManipulator';


export default ({palette, paper}) => `
textarea {
  font-size: 16px !important; /* In smartphone, will not scale automatically */
}
.ReactCodeMirror {
  position: absolute;
  width: 100%;
  height: 100%;
  transition: ${transitions.easeOut()};
}
.CodeMirror {
  font-family: Consolas, "Liberation Mono", Menlo, Courier, monospace;
  width: 100%;
  height: 100%;
  background-color: ${grey100};
}
.CodeMirror-gutters {
  border-color: ${palette.primary1Color} !important;
}
.CodeMirror-hints {
  z-index: 1000;
}
.Feeles-asset-opener-begin {
  cursor: pointer;
  margin: -22px 0 0 -5px;
  z-index: 2;
  color: ${palette.alternateTextColor};
  background-color: ${fade(palette.primary1Color, 1)};
  padding: 2px 40px 2px 5px;
  border-top-right-radius: 1rem;
  white-space: pre;
  box-shadow: ${paper.zDepthShadows[1]};
}
.Feeles-asset-opener-end {
  cursor: pointer;
  margin: -22px 0 0 -5px;
  z-index: 2;
  color: ${palette.alternateTextColor};
  background-color: ${fade(palette.primary1Color, 1)};
  padding: 2px 40px 2px 5px;
  border-bottom-right-radius: 1rem;
  white-space: pre;
  box-shadow: ${paper.zDepthShadows[1]};
}
.cm-s-default .cm-property {
  color: ${blueA700};
}
div.CodeMirror:not(.CodeMirror-focused) .CodeMirror-line>span {
  background-color: ${grey300};
}
div.CodeMirror:not(.CodeMirror-focused) .CodeMirror-line>span>span.cm-tab,
div.CodeMirror:not(.CodeMirror-focused) .CodeMirror-line>span>span.cm-comment {
  background-color: ${grey100};
}
div.CodeMirror span.CodeMirror-matchingbracket {
  font-size: 30px;
  line-height: 16px;
  vertical-align: middle;
}`;
