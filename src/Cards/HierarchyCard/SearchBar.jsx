import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
// import AutoComplete from '@material-ui/core/AutoComplete';
import Paper from '@material-ui/core/Paper';
import IconButton from '@material-ui/core/IconButton';
import ActionSearch from '@material-ui/icons/Search';
import Button from '@material-ui/core/Button';
import ActionDeleteForever from '@material-ui/icons/DeleteForever';
import NavigationClose from '@material-ui/icons/Close';

import TrashBox from './TrashBox';
import search, { getOptions } from './search';
import DesktopFile from './DesktopFile';

const SearchBarHeight = 40;

const getStyles = (props, context, state) => {
  const { palette, spacing, prepareStyles } = context.muiTheme;
  const { focus } = state;

  return {
    root: prepareStyles({
      display: 'flex',
      alignItems: 'center',
      boxSizing: 'border-box',
      width: '100%',
      height: SearchBarHeight,
      paddingRight: 16,
      paddingLeft: spacing.desktopGutterMini,
      zIndex: 100
    }),
    bar: {
      display: 'flex',
      alignItems: 'center',
      width: '100%',
      height: SearchBarHeight,
      paddingLeft: spacing.desktopGutterMini,
      backgroundColor: palette.canvasColor,
      opacity: focus ? 1 : 0.9
    },
    icon: {
      marginTop: 4,
      marginRight: focus ? 8 : 0
    },
    empty: {
      flex: '1 0 auto',
      height: SearchBarHeight,
      marginLeft: spacing.desktopGutterMini
    }
  };
};

export default class SearchBar extends PureComponent {
  static propTypes = {
    files: PropTypes.array.isRequired,
    filterRef: PropTypes.func.isRequired,
    putFile: PropTypes.func.isRequired,
    deleteAll: PropTypes.func.isRequired,
    onOpen: PropTypes.func.isRequired,
    saveAs: PropTypes.func.isRequired,
    localization: PropTypes.object.isRequired
  };

  static contextTypes = {
    muiTheme: PropTypes.object.isRequired
  };

  state = {
    focus: false,
    showTrashes: false,
    query: ''
  };

  componentDidMount() {
    this.handleUpdate('');
  }

  handleUpdate = query => {
    const { filterRef } = this.props;

    const options = getOptions(query);
    filterRef(file => search(file, query, options));

    this.setState({
      query,
      showTrashes: options.showTrashes
    });
  };

  handleTrashBoxTap = () => {
    const { query, showTrashes } = this.state;

    if (!showTrashes) {
      this.handleUpdate(':trash ' + query);
    } else {
      this.handleUpdate(query.replace(/(^|\s):trash(\s|$)/g, '$1'));
    }
  };

  render() {
    const { putFile, onOpen, deleteAll, localization } = this.props;
    const { showTrashes, query } = this.state;
    const {
      secondaryTextColor,
      alternateTextColor
    } = this.context.muiTheme.palette;
    const fileNames = this.props.files.map(f => f.moduleName).filter(s => s);

    const { root, bar, icon, empty } = getStyles(
      this.props,
      this.context,
      this.state
    );

    return (
      <div style={root}>
        <TrashBox
          showTrashes={showTrashes}
          putFile={putFile}
          onClick={this.handleTrashBoxTap}
        />
        <DesktopFile onOpen={onOpen} saveAs={this.props.saveAs} />
        <Paper zDepth={3} style={bar}>
          <ActionSearch style={icon} color={secondaryTextColor} />
          {/* <AutoComplete
            id="search"
            searchText={query}
            dataSource={fileNames}
            maxSearchResults={5}
            onNewRequest={this.handleUpdate}
            onUpdateInput={this.handleUpdate}
            onFocus={() => this.setState({ focus: true })}
            onBlur={() => this.setState({ focus: false })}
            fullWidth
          /> */}
          <IconButton disabled={!query} onClick={() => this.handleUpdate('')}>
            <NavigationClose color={secondaryTextColor} />
          </IconButton>
        </Paper>
        {showTrashes ? (
          <Button
            variant="raised"
            color="secondary"
            label={localization.hierarchyCard.emptyTrashBox}
            icon={<ActionDeleteForever color={alternateTextColor} />}
            style={empty}
            onClick={deleteAll}
          />
        ) : null}
      </div>
    );
  }
}
