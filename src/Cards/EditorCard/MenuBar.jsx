import React from 'react';
import PropTypes from 'prop-types';
import { style } from 'typestyle';
import Button from '@material-ui/core/Button';
import HardwareKeyboardBackspace from '@material-ui/icons/KeyboardBackspace';
import ContentSave from '@material-ui/icons/Save';

import PlayMenu from './PlayMenu';
import CardFloatingBar from '../CardFloatingBar';

const cn = {
  blank: style({
    flex: '1 1 auto'
  })
};

export default class MenuBar extends React.Component {
  static propTypes = {
    localization: PropTypes.object.isRequired,
    getFiles: PropTypes.func.isRequired,
    href: PropTypes.string.isRequired,
    handleUndo: PropTypes.func.isRequired,
    setLocation: PropTypes.func.isRequired
  };

  state = {};

  handleSaveAndRun = () => this.props.setLocation();

  render() {
    return (
      <CardFloatingBar>
        {this.props.localization.editorCard.title}
        <Button
          variant="text"
          disabled={!this.state.hasHistory}
          onClick={this.props.handleUndo}
        >
          <HardwareKeyboardBackspace />
          {this.props.localization.editorCard.undo}
        </Button>
        <Button
          variant="text"
          disabled={!this.state.hasChanged}
          onClick={this.handleSaveAndRun}
        >
          <ContentSave />
          {this.props.localization.editorCard.save}
        </Button>
        <div className={cn.blank} />
        <PlayMenu
          getFiles={this.props.getFiles}
          setLocation={this.props.setLocation}
          href={this.props.href}
          localization={this.props.localization}
        />
      </CardFloatingBar>
    );
  }
}
