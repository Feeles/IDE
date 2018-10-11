import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import EditorModeEdit from '@material-ui/icons/Edit';

import { Tab } from '../ChromeTab/';

export default class EditFile extends PureComponent {
  static propTypes = {
    fileKey: PropTypes.string.isRequired,
    findFile: PropTypes.func.isRequired,
    selectTab: PropTypes.func.isRequired,
    localization: PropTypes.object.isRequired
  };

  handleEdit = () => {
    const { fileKey, localization } = this.props;
    const getFile = () => this.props.findFile(item => item.key === fileKey);
    const item = getFile();

    if (item && confirm(localization.common.wantToOpen(item.name))) {
      const tab = new Tab({ getFile });
      this.props.selectTab(tab);
    }
  };

  render() {
    const { localization } = this.props;

    return (
      <Button
        variant="flat"
        disabled={!this.props.fileKey}
        onClick={this.handleEdit}
      >
        <EditorModeEdit />
        {localization.common.editFile}
      </Button>
    );
  }
}
