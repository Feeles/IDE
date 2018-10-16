/* eslint-disable react/prop-types */
import React, { PureComponent } from 'react';
import { withTheme } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import { style } from 'typestyle';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import { emphasize } from '@material-ui/core/styles/colorManipulator';
import ActionOpenInNew from '@material-ui/icons/OpenInNew';
import EditorModeEdit from '@material-ui/icons/Edit';

import CodeMirrorComponent from '../../utils/CodeMirrorComponent';
import MDReactComponent from '../../jsx/MDReactComponent';
import { Tab } from '../../ChromeTab/';

const cn = {
  blockquote: style({
    marginLeft: '1rem',
    paddingLeft: '1rem',
    borderLeftWidth: 5,
    borderLeftStyle: 'solid'
  }),
  img: style({
    maxWidth: '100%'
  }),
  table: style({
    margin: '1rem 0',
    borderLeftWidth: 1,
    borderLeftStyle: 'solid',
    borderSpacing: 0
  }),
  containedButton: style({
    margin: 4
  }),
  containedButtonLabel: style({
    textTransform: 'none'
  })
};
const getCn = props => ({
  root: style({
    boxSizing: 'border-box',
    overflow: 'scroll',
    borderColor: props.theme.palette.divider
  }),
  th: style({
    padding: props.theme.spacing.unit,
    borderTopWidth: 1,
    borderTopStyle: 'solid',
    borderRightWidth: 1,
    borderRightStyle: 'solid',
    borderBottomWidth: 1,
    borderBottomStyle: 'solid'
  }),
  td: style({
    padding: props.theme.spacing.unit,
    borderRightWidth: 1,
    borderRightStyle: 'solid',
    borderBottomWidth: 1,
    borderBottomStyle: 'solid'
  }),
  code: style({
    backgroundColor: emphasize(props.theme.palette.background.paper, 0.07),
    padding: '.2em',
    borderRadius: 2
  })
});

const mdComponents = [
  {
    // 外部リンク
    validate(tag, props) {
      return tag === 'a' && isValidURL(props.href);
    },
    render(tag, props, children) {
      return (
        <Button
          variant="contained"
          color="primary"
          key={props.key}
          href={props.href}
          labelPosition="before"
          target="_blank"
          className={cn.containedButton}
        >
          <span className={cn.containedButtonLabel}>{children}</span>
          <ActionOpenInNew />
        </Button>
      );
    }
  },
  {
    // Feeles 内リンク
    validate(tag) {
      return tag === 'a';
    },
    render(tag, props, children, component) {
      const onClick = () => {
        component.props.setLocation(decodeURIComponent(props.href));
      };
      return (
        <Button
          variant="contained"
          color="primary"
          key={props.key}
          className={cn.containedButton}
          onClick={onClick}
        >
          <span className={cn.containedButtonLabel}>{children}</span>
        </Button>
      );
    }
  },
  {
    // 外部リンク画像
    validate(tag, props) {
      return tag === 'img' && isValidURL(props.src);
    },
    render(tag, props) {
      return <img {...props} className={cn.img} />;
    }
  },
  {
    // Feeles 内画像
    validate(tag) {
      return tag === 'img';
    },
    render(tag, props, children, component) {
      const file = component.props.findFile(decodeURIComponent(props.src));
      if (!file) {
        return <span {...props}>{props.alt}</span>;
      }
      if (file.is('blob')) {
        return <img {...props} className={cn.img} src={file.blobURL} />;
      }

      // Edit file
      const onClick = () => {
        const getFile = () =>
          component.props.findFile(item => item.key === file.key);
        component.props.selectTab(new Tab({ getFile }));
      };
      return (
        <Button
          variant="contained"
          color="primary"
          key={props.key}
          className={cn.containedButton}
          onClick={onClick}
        >
          <EditorModeEdit />
          <span className={cn.containedButtonLabel}>{props.alt}</span>
        </Button>
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
  },
  {
    // 引用
    validate(tag) {
      return tag === 'blockquote';
    },
    render(tag, props, children) {
      <Typography className={cn.blockquote} color="textSecondary">
        {children}
      </Typography>;
    }
  }
];

@withTheme()
export default class Readme extends PureComponent {
  static propTypes = {
    theme: PropTypes.object.isRequired,
    file: PropTypes.object.isRequired,
    findFile: PropTypes.func.isRequired,
    selectTab: PropTypes.func.isRequired,
    getConfig: PropTypes.func.isRequired,
    localization: PropTypes.object.isRequired,
    completes: PropTypes.array.isRequired,
    setLocation: PropTypes.func.isRequired
  };

  render() {
    const dcn = getCn(this.props);
    const onIterate = (tag, props, children) => {
      for (const { validate, render } of mdComponents) {
        if (validate(tag, props)) {
          return render(tag, props, children, this);
        }
      }
      if (tag in cn) {
        props = { ...props, className: cn[tag] };
      }
      if (tag in dcn) {
        props = { ...props, className: dcn[tag] };
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

    return (
      <MDReactComponent
        text={this.props.file.text}
        className={dcn.root}
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
