import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import Dialog from 'material-ui/Dialog';

import { Abort } from './Buttons';

/**
 * HTML5 a要素のdownload属性が実装されていないブラウザのためのfallback
 */
export default class SaveDialog extends PureComponent {
  static propTypes = {
    onRequestClose: PropTypes.func.isRequired,
    content: PropTypes.any,
    localization: PropTypes.object.isRequired
  };

  state = {
    contents:
      this.props.content instanceof Array
        ? this.props.content
        : [this.props.content],
    results: []
  };

  componentDidMount() {
    Promise.all(
      this.state.contents.map(
        item =>
          new Promise(resolve => {
            const reader = new FileReader();
            reader.onload = () =>
              resolve({
                name: item.name,
                href: reader.result
              });
            reader.readAsDataURL(item.blob);
          })
      )
    ).then(results => this.setState({ results }));
  }

  render() {
    const { onRequestClose, localization } = this.props;

    const actions = [
      <Abort
        key="cancel"
        primary
        onClick={onRequestClose}
        label={localization.saveDialog.cancel}
      />
    ];

    const divStyle = {
      textAlign: 'center'
    };

    const linkStyle = {
      fontSize: '2rem'
    };

    return (
      <Dialog
        title={localization.saveDialog.title}
        actions={actions}
        modal={false}
        open={true}
        onRequestClose={onRequestClose}
      >
        {this.state.results.map((item, i) => (
          <div key={i} style={divStyle}>
            <a
              target="_blank"
              rel="noopener noreferrer"
              href={item.href}
              style={linkStyle}
            >
              {item.name}
            </a>
            <p>{localization.saveDialog.description(item.name)}</p>
          </div>
        ))}
      </Dialog>
    );
  }
}
