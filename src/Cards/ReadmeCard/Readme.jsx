/* eslint-disable react/prop-types */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import RaisedButton from '@material-ui/core/RaisedButton';
import { emphasize } from '@material-ui/core/styles/colorManipulator';
import ActionOpenInNew from '@material-ui/core/svg-icons/action/open-in-new';
import EditorModeEdit from '@material-ui/core/svg-icons/editor/mode-edit';

import CodeMirrorComponent from '../../utils/CodeMirrorComponent';
import MDReactComponent from '../../jsx/MDReactComponent';
import { Tab } from '../../ChromeTab/';

const mdComponents = [
  {
    // 外部リンク
    validate(tag, props) {
      return tag === 'a' && isValidURL(props.href);
    },
    render(tag, props, children, component, mdStyles) {
      return (
        <RaisedButton
          primary
          key={props.key}
          label={children}
          href={props.href}
          labelPosition="before"
          target="_blank"
          style={mdStyles.raisedButton}
          labelStyle={mdStyles.raisedButtonLabel}
          icon={<ActionOpenInNew />}
        />
      );
    }
  },
  {
    // Feeles 内リンク
    validate(tag) {
      return tag === 'a';
    },
    render(tag, props, children, component, mdStyles) {
      const onClick = () => {
        component.props.setLocation(decodeURIComponent(props.href));
      };
      return (
        <RaisedButton
          primary
          key={props.key}
          label={children}
          style={mdStyles.raisedButton}
          labelStyle={mdStyles.raisedButtonLabel}
          onClick={onClick}
        />
      );
    }
  },
  {
    // 外部リンク画像
    validate(tag, props) {
      return tag === 'img' && isValidURL(props.src);
    },
    render(tag, props, children, component, mdStyles) {
      return <img {...props} style={mdStyles.img} />;
    }
  },
  {
    // Feeles 内画像
    validate(tag) {
      return tag === 'img';
    },
    render(tag, props, children, component, mdStyles) {
      const file = component.props.findFile(decodeURIComponent(props.src));
      if (!file) {
        return <span {...props}>{props.alt}</span>;
      }
      if (file.is('blob')) {
        return <img {...props} style={mdStyles.img} src={file.blobURL} />;
      }

      // Edit file
      const onClick = () => {
        const getFile = () =>
          component.props.findFile(item => item.key === file.key);
        component.props.selectTab(new Tab({ getFile }));
      };
      return (
        <RaisedButton
          primary
          key={props.key}
          label={props.alt}
          icon={<EditorModeEdit />}
          style={mdStyles.raisedButton}
          labelStyle={mdStyles.raisedButtonLabel}
          onClick={onClick}
        />
      );
    }
  },
  {
    // インタプリタ
    validate(tag) {
      return tag === 'pre';
    },
    render(tag, props, children) {
      const code = children[0].props.children[0] || '';
      const containerStyle = {
        position: 'relative',
        height: Math.min(20, code.split('\n').length) + 'rem',
        paddingBottom: 8
      };

      return (
        <div key={props.key + code} style={containerStyle}>
          <CodeMirrorComponent
            id="Readme"
            value={code}
            mode="javascript"
            keyMap="sublime"
            readOnly
          />
        </div>
      );
    }
  }
];

const mdStyle = (props, state, context) => {
  const { palette, spacing } = context.muiTheme;

  const tableBorder = `1px solid ${palette.disabledColor}`;

  return {
    blockquote: {
      color: palette.secondaryTextColor,
      marginLeft: '1rem',
      paddingLeft: '1rem',
      borderLeft: `5px solid ${palette.disabledColor}`
    },
    img: {
      maxWidth: '100%'
    },
    table: {
      margin: '1rem 0',
      borderLeft: tableBorder,
      borderSpacing: 0
    },
    th: {
      padding: spacing.desktopGutterMini,
      borderTop: tableBorder,
      borderRight: tableBorder,
      borderBottom: tableBorder
    },
    td: {
      padding: spacing.desktopGutterMini,
      borderRight: tableBorder,
      borderBottom: tableBorder
    },
    code: {
      backgroundColor: emphasize(palette.canvasColor, 0.07),
      padding: '.2em',
      borderRadius: 2
    },
    iconStyle: {
      transform: 'scale(0.6)',
      verticalAlign: 'middle'
    },
    iconColor: palette.alternateTextColor,
    raisedButton: {
      margin: 4
    },
    raisedButtonLabel: {
      textTransform: 'none'
    }
  };
};

export default class Readme extends PureComponent {
  static propTypes = {
    file: PropTypes.object.isRequired,
    findFile: PropTypes.func.isRequired,
    selectTab: PropTypes.func.isRequired,
    getConfig: PropTypes.func.isRequired,
    localization: PropTypes.object.isRequired,
    completes: PropTypes.array.isRequired,
    setLocation: PropTypes.func.isRequired
  };

  static contextTypes = {
    muiTheme: PropTypes.object.isRequired
  };

  render() {
    const mdStyles = mdStyle(this.props, this.state, this.context);

    const onIterate = (tag, props, children) => {
      for (const { validate, render } of mdComponents) {
        if (validate(tag, props)) {
          return render(tag, props, children, this, mdStyles);
        }
      }
      if (tag in mdStyles) {
        props = { ...props, style: mdStyles[tag] };
      }
      if (children.length < 1) {
        children = null;
      }
      if (tag === 'p') {
        tag = 'div';
        props = { ...props, style: { ...props.style, margin: '14px 0' } };
      }
      return React.createElement(tag, props, children);
    };

    const styles = {
      root: {
        boxSizing: 'border-box',
        overflow: 'scroll'
      }
    };

    return (
      <MDReactComponent
        text={this.props.file.text}
        style={styles.root}
        onIterate={onIterate}
      />
    );
  }
}

function isValidURL(url) {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
}
