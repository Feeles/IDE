import React, { PureComponent } from 'react'
import { withTheme } from '@material-ui/core/styles'
import PropTypes from 'prop-types'
import { style } from 'typestyle'
import AutoComplete from '../../jsx/IntegrationReactSelect'
import Paper from '@material-ui/core/Paper'
import ActionSearch from '@material-ui/icons/Search'
import Button from '@material-ui/core/Button'
import ActionDeleteForever from '@material-ui/icons/DeleteForever'

import TrashBox from './TrashBox'
import search, { getOptions } from './search'
import DesktopFile from './DesktopFile'

const SearchBarHeight = 40

const cn = {
  icon: style({
    marginTop: 4
  })
}
const getCn = props => ({
  root: style({
    display: 'flex',
    alignItems: 'center',
    boxSizing: 'border-box',
    width: '100%',
    height: SearchBarHeight,
    paddingRight: 16,
    paddingLeft: props.theme.spacing.unit,
    zIndex: 100
  }),
  bar: style({
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    height: SearchBarHeight,
    paddingLeft: props.theme.spacing.unit,
    backgroundColor: props.theme.palette.background.paper
  }),
  empty: style({
    flex: '1 0 auto',
    height: SearchBarHeight,
    marginLeft: props.theme.spacing.unit
  })
})

@withTheme()
export default class SearchBar extends PureComponent {
  static propTypes = {
    theme: PropTypes.object.isRequired,
    files: PropTypes.array.isRequired,
    filterRef: PropTypes.func.isRequired,
    putFile: PropTypes.func.isRequired,
    deleteAll: PropTypes.func.isRequired,
    onOpen: PropTypes.func.isRequired,
    saveAs: PropTypes.func.isRequired,
    localization: PropTypes.object.isRequired
  }

  state = {
    showTrashes: false,
    query: ''
  }

  componentDidMount() {
    this.handleUpdate('')
  }

  handleUpdate = (value, context) => {
    const query = typeof value === 'object' ? value.value : value
    if (!query && context) {
      if (context.action !== 'input-change') {
        // react-select は value="" でイベント発火することがある
        return
      }
    }
    const { filterRef } = this.props

    const options = getOptions(query)
    filterRef(file => search(file, query, options))

    this.setState({
      query,
      showTrashes: options.showTrashes
    })
  }

  handleTrashBoxTap = () => {
    const { query, showTrashes } = this.state

    if (!showTrashes) {
      this.handleUpdate(':trash ' + query)
    } else {
      this.handleUpdate(query.replace(/(^|\s):trash(\s|$)/g, '$1'))
    }
  }

  render() {
    const dcn = getCn(this.props)
    const { putFile, onOpen, deleteAll, localization } = this.props
    const { showTrashes, query } = this.state
    const fileNames = this.props.files
      .map(f => f.moduleName)
      .filter(s => s)
      .map(s => ({
        value: s,
        label: s
      }))

    return (
      <div className={dcn.root}>
        <TrashBox
          showTrashes={showTrashes}
          putFile={putFile}
          onClick={this.handleTrashBoxTap}
        />
        <DesktopFile onOpen={onOpen} saveAs={this.props.saveAs} />
        <Paper elevation={3} className={dcn.bar}>
          <ActionSearch className={cn.icon} />
          <AutoComplete
            value={query}
            suggestions={fileNames}
            onChange={this.handleUpdate}
            placeholder=""
          />
        </Paper>
        {showTrashes ? (
          <Button
            variant="contained"
            color="secondary"
            className={dcn.empty}
            onClick={deleteAll}
          >
            <ActionDeleteForever />
            {localization.hierarchyCard.emptyTrashBox}
          </Button>
        ) : null}
      </div>
    )
  }
}
