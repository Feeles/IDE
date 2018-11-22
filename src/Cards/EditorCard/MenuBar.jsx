import React from 'react';
import PropTypes from 'prop-types';
import { style } from 'typestyle';
import Button from '@material-ui/core/Button';
import HardwareKeyboardBackspace from '@material-ui/icons/KeyboardBackspace';
import Layers from '@material-ui/icons/Layers';
import LayersClear from '@material-ui/icons/LayersClear';

import PlayMenu from './PlayMenu';
import CardFloatingBar from '../CardFloatingBar';
import { IconButton, withTheme } from '@material-ui/core';
import SelectTab from './SelectTab';

const cn = {
  blank: style({
    flex: '1 1 auto'
  })
};

const getCn = props => ({
  icon: style({
    color: props.theme.typography.button.color
  })
});

@withTheme()
export default class MenuBar extends React.Component {
  static propTypes = {
    theme: PropTypes.object.isRequired,
    localization: PropTypes.object.isRequired,
    getFiles: PropTypes.func.isRequired,
    href: PropTypes.string.isRequired,
    handleUndo: PropTypes.func.isRequired,
    setLocation: PropTypes.func.isRequired,
    hasChanged: PropTypes.bool.isRequired,
    hasHistory: PropTypes.bool.isRequired,
    tabs: PropTypes.array.isRequired,
    filePath: PropTypes.string.isRequired,
    showLineWidget: PropTypes.bool.isRequired,
    setShowLineWidget: PropTypes.func.isRequired,
    globalEvent: PropTypes.object.isRequired
  };

  toggleLineWidget = () => {
    const { showLineWidget } = this.props;
    this.props.setShowLineWidget(!showLineWidget);
  };

  render() {
    const dcn = getCn(this.props);

    return (
      <CardFloatingBar>
        {this.props.localization.editorCard.title}
        <Button
          variant="text"
          disabled={!this.props.hasHistory}
          onClick={this.props.handleUndo}
        >
          <HardwareKeyboardBackspace />
          {this.props.localization.editorCard.undo}
        </Button>
        <SelectTab
          filePath={this.props.filePath}
          tabs={this.props.tabs}
          globalEvent={this.props.globalEvent}
          localization={this.props.localization}
        />
        <IconButton onClick={this.toggleLineWidget}>
          {this.props.showLineWidget ? (
            <Layers className={dcn.icon} />
          ) : (
            <LayersClear />
          )}
        </IconButton>
        <div className={cn.blank} />
        <PlayMenu
          getFiles={this.props.getFiles}
          setLocation={this.props.setLocation}
          href={this.props.href}
          localization={this.props.localization}
          hasChanged={this.props.hasChanged}
        />
      </CardFloatingBar>
    );
  }
}
