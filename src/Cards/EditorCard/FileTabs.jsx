import React from 'react';
import PropTypes from 'prop-types';
import { style } from 'typestyle';

import ChromeTab from '../../ChromeTab/';
import { withTheme } from '@material-ui/core';

const MAX_TAB = 5;

const getCn = props => ({
  root: style({
    display: 'flex',
    alignItems: 'flex-end',
    height: 32,
    zIndex: 10,
    borderBottom: `1px solid ${props.theme.palette.primary.main}`,
    paddingLeft: 47 // ハードコーディング
  })
});

@withTheme()
export default class FileTabs extends React.Component {
  static propTypes = {
    localization: PropTypes.object.isRequired,
    selectTab: PropTypes.func.isRequired,
    closeTab: PropTypes.func.isRequired,
    currentDoc: PropTypes.object.isRequired,
    tabs: PropTypes.array.isRequired
  };

  render() {
    const dcn = getCn(this.props);

    const tabs = [];
    const containerWidth = this.tabContainer
      ? this.tabContainer.getBoundingClientRect().width
      : 0;
    for (const tab of this.props.tabs) {
      if (tabs.length < MAX_TAB) {
        // current tab でなければ undefined
        const doc = this.props.currentDoc[tab.file.key];
        tabs.push(
          <ChromeTab
            key={tab.key}
            tab={tab}
            file={tab.file}
            tabs={tabs}
            isSelected={tab.isSelected}
            localization={this.props.localization}
            handleSelect={this.props.selectTab}
            handleClose={this.props.closeTab}
            containerWidth={containerWidth}
            doc={doc}
          />
        );
      }
    }

    return (
      <div className={dcn.root} ref={ref => (this.tabContainer = ref)}>
        {tabs}
      </div>
    );
  }
}
