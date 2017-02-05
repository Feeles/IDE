import React, { PureComponent, PropTypes } from 'react';
import transitions from 'material-ui/styles/transitions';
import { emphasize } from 'material-ui/utils/colorManipulator';
import ActionOpenInNew from 'material-ui/svg-icons/action/open-in-new';


import MDReactComponent from '../../lib/MDReactComponent';
import { Tab } from '../ChromeTab/';
import { Editor } from '../EditorPane/';
import ShotFrame from './ShotFrame';

const BarHeight = 36;


const mdComponents = [
  {
    // 外部リンク
    validate(tag, props) {
      return tag === 'a' && isValidURL(props.href);
    },
    render(tag, props, children, mdStyles) {
      return (
        <a {...props} style={mdStyles.a} target="_blank">
          {children}
          <ActionOpenInNew
            style={mdStyles.iconStyle}
            color={mdStyles.iconColor}
          />
        </a>
      );
    },
  }, {
    // Feeles 内リンク
    validate(tag, props) {
      return tag === 'a';
    },
    render(tag, props, children, mdStyles) {
      const touchTap = () => {
        const found = props.findFile(href);
        if (found) {
          const getFile = () => props.findFile(item => item.key === found.key);
          props.selectTab(new Tab({ getFile }));
        }
      };
      return <a {...props}
        href="javascript:void(0)"
        style={mdStyles.a}
        onTouchTap={touchTap}
      >{children}</a>;
    }
  }, {
    // 外部リンク画像
    validate(tag, props) {
      return tag === 'img' && isValidURL(props.src);
    },
    render(tag, props, children, mdStyles) {
      return <img {...props} style={mdStyles.img} />;
    }
  }, {
    // Feeles 内画像
    validate(tag, props) {
      return tag === 'img';
    },
    render(tag, props, children, mdStyles) {
      const file = props.findFile(props.src);
      if (!file) {
        return <span {...props}>{props.alt}</span>
      }
      if (file.is('image')) {
        return <img {...props} style={mdStyles.img} src={file.blobURL} />
      }
      if (file.is('html')) {
        const onTouchTap = (event) => {
          event.stopPropagation();
          this.props.setLocation({
            href: file.name,
          });
        };
        return (
          <a key={props.key}
            href="javascript: void(0)"
            onTouchTap={onTouchTap}
          >{props.alt}</a>
        );
      }
    }
  }, {
    // インタプリタ
    validate(tag, props) {
      return tag === 'pre';
    },
    render(tag, props, children, mdStyles) {
      return (
        <ShotFrame
          key={props.key}
          text={children[0].props.children[0] || ''}
          onShot={this.props.onShot}
          localization={localization}
          getConfig={getConfig}
          completes={completes}
        />
      );
    }
  }
];

const mdStyle = (props, state, context) => {
  const {
    palette,
    spacing,
  } = context.muiTheme;

  const tableBorder = `1px solid ${palette.disabledColor}`;

  return {
    blockquote: {
      color: palette.secondaryTextColor,
      marginLeft: '1rem',
      paddingLeft: '1rem',
      borderLeft: `5px solid ${palette.disabledColor}`,
    },
    img: {
      maxWidth: '100%',
    },
    table: {
      margin: '1rem 0',
      borderLeft: tableBorder,
      borderSpacing: 0,
    },
    th: {
      padding: spacing.desktopGutterMini,
      borderTop: tableBorder,
      borderRight: tableBorder,
      borderBottom: tableBorder,
    },
    td: {
      padding: spacing.desktopGutterMini,
      borderRight: tableBorder,
      borderBottom: tableBorder,
    },
    code: {
      backgroundColor: emphasize(palette.canvasColor, 0.07),
      padding: '.2em',
      borderRadius: 2,
    },
    a: {
      backgroundColor: palette.primary1Color,
      color: palette.alternateTextColor,
      borderRadius: 2,
      textDecoration: 'none',
      padding: '.4em',
      lineHeight: 2,
    },
    iconStyle: {
      transform: 'scale(0.6)',
      verticalAlign: 'middle',
    },
    iconColor: palette.alternateTextColor,
  };
};

export default class Readme extends PureComponent {

  static propTypes = {
    file: PropTypes.object.isRequired,
    onShot: PropTypes.func.isRequired,
    findFile: PropTypes.func.isRequired,
    selectTab: PropTypes.func.isRequired,
    getConfig: PropTypes.func.isRequired,
    localization: PropTypes.object.isRequired,
    completes: PropTypes.array.isRequired,
    setLocation: PropTypes.func.isRequired,
  };

  static contextTypes = {
    muiTheme: PropTypes.object.isRequired,
  };

  render() {
    const mdStyles = mdStyle(this.props, this.state, this.context);

    const onIterate = (tag, props, children) => {
      for (const {validate, render} of mdComponents) {
        if (validate(tag, props)) {
          return render(tag, props, children, mdStyles);
        }
      }
      if (tag in mdStyles) {
        props = {...props, style: mdStyles[tag]};
      }
      if (children.length < 1) {
        children = null;
      }
      return React.createElement(tag, props, children);
    };

    const styles = {
      root: {
        boxSizing: 'border-box',
        overflow: 'scroll',
      },
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
