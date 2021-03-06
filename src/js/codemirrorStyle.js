import blue from '@material-ui/core/colors/blue'
import { px, rgb } from 'csx'

export const fontSize = 20

export default ({ palette, shadows, transitions }) =>
  `
textarea {
  font-size: 16px !important; /* In smartphone, will not scale automatically */
}
.CodeMirror {
  position: absolute;
  font-family: Consolas, "Liberation Mono", Menlo, Courier, monospace;
  width: 100%;
  height: 100%;
  transition: ${transitions.create()};
}
.CodeMirror-gutters {
  border-color: ${palette.primary.main} !important;
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
  color: ${palette.primary.contrastText};
  background-color: ${palette.primary.main};
  box-shadow: ${shadows[2]};
}
.Feeles-asset .Feeles-asset-button:hover {
  background-color: ${palette.primary.dark};
}
.Feeles-asset .Feeles-asset-blank {
  display: inline-block;
  visibility: hidden;
}
.Feeles-dropdown {
  transform: translateY(${px(-fontSize)});
  height: 0;
  white-space: pre;
  z-index: 3;
}
.Feeles-dropdown .Feeles-dropdown-shadow {
  transform: translateX(${px(-fontSize)});
  display: inline-block;
  border-radius: 2px;
  box-shadow: ${shadows[1]};
  height: ${px(fontSize)}; /* TODO: Flexible font-size */
}
.Feeles-dropdown .Feeles-dropdown-button {
  display: inline-block;
  padding: 2px 10px 2px ${px(fontSize)};
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
  color: ${palette.primary.contrastText};
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
  box-shadow: 0 0 0 100em ${palette.primary.main};
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
  color: ${blue['A700']};
}

.cm-tab {
  background-color: ${rgb(0, 0, 0).fade(0.1)};
  opacity: 0.8;
}
.cm-tab + .cm-tab {
  background-color: ${rgb(0, 0, 0).fade(0.2)};
}
.cm-tab + .cm-tab + .cm-tab {
  background-color: ${rgb(0, 0, 0).fade(0.3)};
}
.cm-tab + .cm-tab + .cm-tab + .cm-tab {
  background-color: ${rgb(0, 0, 0).fade(0.4)};
}
.cm-tab + .cm-tab + .cm-tab + .cm-tab + .cm-tab {
  background-color: ${rgb(0, 0, 0).fade(0.5)};
}
.cm-tab + .cm-tab + .cm-tab + .cm-tab + .cm-tab + .cm-tab {
  background-color: ${rgb(0, 0, 0).fade(0.6)};
}
div.CodeMirror span.CodeMirror-matchingbracket {
  text-shadow: 0 0 4px #000, 0 -8px 10px #000, 0 8px 10px #000;
}
div.CodeMirror.CodeMirror-focused pre>span>span.cm-comment {
  opacity: 0.5;
}
div.CodeMirror pre {
  line-height: ${px(fontSize)};
}

div.CodeMirror-cursor {
  border-left-width: 2px;
}
`
