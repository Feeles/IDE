import React, { PureComponent } from 'react'
import { withTheme } from '@material-ui/core/styles'
import { fade } from '@material-ui/core/styles/colorManipulator'
import PropTypes from 'prop-types'
import { style, classes } from 'typestyle'
import { url } from 'csx'
import Popover from '@material-ui/core/Popover'
import Button from '@material-ui/core/Button'
import ButtonBase from '@material-ui/core/ButtonBase'
import Typography from '@material-ui/core/Typography'
import Add from '@material-ui/icons/Add'
import Description from '@material-ui/icons/Description'
import { pathToInstall } from './AssetPane'

const protocols = ['https:', 'http:', 'data:', 'file:', 'blob:']
const iconSize = 48

const cn = {
  mainButton: style({
    width: 80,
    height: 80,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch'
  }),
  mainIcon: style({
    flex: 1,
    backgroundSize: 'contain',
    backgroundPosition: '50% 50%',
    backgroundRepeat: 'no-repeat'
  }),
  actions: style({
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: 2
  }),
  iconButton: style({
    flex: 1,
    minWidth: 36
  }),
  popoverClasses: {
    paper: style({
      padding: 8,
      maxWidth: 500
    })
  },
  label: style({
    fontSize: 10,
    fontWeight: 600
  }),
  blank: style({
    display: 'inline-flex',
    width: 8
  }),
  variationWrapper: style({
    display: 'flex',
    flexWrap: 'nowrap',
    justifyContent: 'flex-start'
  })
}
const getCn = ({ theme }) => ({
  root: style({
    position: 'relative',
    margin: '8px 30px 0px 8px'
  }),
  button: style({
    color: theme.palette.getContrastText(theme.palette.text.primary),
    transition: theme.transitions.create('background-color'),
    backgroundColor: fade(theme.palette.grey[600], 0.6),
    $nest: {
      '&:hover': {
        backgroundColor: theme.palette.grey[600]
      },
      '&:disabled': {
        color: theme.palette.text.disabled
      }
    }
  }),
  variation: style({
    maxWidth: iconSize,
    height: iconSize,
    boxSizing: 'content-box',
    borderStyle: 'solid',
    borderWidth: 2,
    borderColor: 'transparent',
    borderRadius: theme.shape.borderRadius,
    marginRight: theme.spacing.unit,
    marginBottom: theme.spacing.unit,
    cursor: 'pointer',
    backgroundColor: theme.palette.grey[200],
    $nest: {
      '&:hover': {
        backgroundColor: theme.palette.grey[400]
      },
      '&>img': {
        maxWidth: iconSize,
        height: iconSize
      }
    }
  }),
  selected: style({
    borderColor: '#4A90E2',
    backgroundColor: theme.palette.grey[400]
  })
})

@withTheme()
export default class AssetButton extends PureComponent {
  static propTypes = {
    name: PropTypes.string,
    description: PropTypes.string,
    iconUrl: PropTypes.string,
    insertCode: PropTypes.string,
    moduleCode: PropTypes.string,
    filePath: PropTypes.string,
    variations: PropTypes.array,

    theme: PropTypes.object.isRequired,
    insertAsset: PropTypes.func.isRequired,
    openFile: PropTypes.func.isRequired,
    findFile: PropTypes.func.isRequired,
    localization: PropTypes.object.isRequired,
    globalEvent: PropTypes.object.isRequired,
    asset: PropTypes.object.isRequired,
    linkOnly: PropTypes.bool.isRequired
  }

  static defaultProps = {
    name: '',
    description: ''
  }

  state = {
    anchorEl: null,
    backgroundStyle: {},
    selectedIndex: 0 // 選択中の variation
  }

  get selected() {
    const {
      name,
      description,
      iconUrl,
      insertCode,
      moduleCode,
      filePath,
      variations
    } = this.props

    return variations
      ? variations[this.state.selectedIndex]
      : {
          name,
          description,
          iconUrl,
          insertCode,
          moduleCode,
          filePath
        }
  }

  get filePathToOpen() {
    // 最初から存在するファイルにアクセス => filePath
    // 追加してからアクセス => asset.module[name]
    const { filePath, asset, name } = this.props
    return (
      filePath || (asset.module[name] ? `${pathToInstall}/${name}.js` : null)
    )
  }

  get filePathToOpenSelected() {
    // 最初から存在するファイルにアクセス => filePath
    // 追加してからアクセス => asset.module[name]
    const selected = this.selected
    return (
      selected.filePath ||
      (this.props.asset.module[selected.name]
        ? `${pathToInstall}/${selected.name}.js`
        : null)
    )
  }

  handleOpen = event => {
    // リンクのみ表示なら「改造する」, そうでなければ Popover を開く
    if (this.props.linkOnly) {
      this.handleOpenFile()
    } else {
      this.setState({ anchorEl: event.currentTarget })
    }
  }

  handleClose = () => {
    this.setState({ anchorEl: null })
  }

  static getDerivedStateFromProps(props, state) {
    let backgroundImage = ''

    if (props.iconUrl) {
      if (protocols.some(p => props.iconUrl.indexOf(p) === 0)) {
        backgroundImage = url(props.iconUrl)
      } else {
        const file = props.findFile(props.iconUrl)
        if (file) {
          backgroundImage = url(file.blobURL)
        }
      }
    }
    if (
      backgroundImage &&
      backgroundImage !== state.backgroundStyle.backgroundImage
    ) {
      return {
        backgroundStyle: { backgroundImage }
      }
    }
    return null
  }

  handleInsertAsset = () => {
    const { name, insertCode } = this.props
    this.handleClose()
    this.props.insertAsset({ name, insertCode })
  }

  handleInsertAssetSelected = () => {
    this.handleClose()
    this.props.insertAsset(this.selected)
  }

  handleOpenFile = () => {
    this.handleClose()
    this.props.openFile({
      name: this.props.name,
      filePath: this.filePathToOpen,
      iconUrl: this.props.iconUrl
    })
  }

  handleOpenFileSelected = () => {
    this.handleClose()
    this.props.openFile({
      name: this.selected.name,
      filePath: this.filePathToOpenSelected,
      iconUrl: this.selected.iconUrl
    })
  }

  render() {
    const dcn = getCn(this.props)
    const { localization, variations, linkOnly } = this.props
    const { selectedIndex } = this.state
    const selected = this.selected // Popover の中は選択中のバリエーションに切り替わる

    return (
      <>
        <div className={dcn.root}>
          <ButtonBase
            focusRipple
            className={classes(dcn.button, cn.mainButton)}
            onClick={this.handleOpen}
          >
            <div className={cn.mainIcon} style={this.state.backgroundStyle} />
            <span className={cn.label}>{this.props.name}</span>
          </ButtonBase>
          {linkOnly ? null : (
            <div className={cn.actions}>
              <ButtonBase
                focusRipple
                disabled={!this.props.insertCode}
                className={classes(dcn.button, cn.iconButton)}
                onClick={this.handleInsertAsset}
              >
                <Add />
              </ButtonBase>
              <ButtonBase
                focusRipple
                disabled={!this.filePathToOpen}
                className={classes(dcn.button, cn.iconButton)}
                onClick={this.handleOpenFile}
              >
                <Description />
              </ButtonBase>
            </div>
          )}
        </div>
        {linkOnly ? null : (
          <Popover
            open={Boolean(this.state.anchorEl)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            anchorEl={this.state.anchorEl}
            classes={cn.popoverClasses}
            onClose={this.handleClose}
          >
            <Typography variant="h5">{selected.name}</Typography>
            <Typography variant="body1" gutterBottom>
              {selected.description}
            </Typography>
            {variations && (
              <div className={cn.variationWrapper}>
                {variations.map((child, i) => (
                  <div
                    key={i}
                    className={classes(
                      dcn.variation,
                      selectedIndex === i && dcn.selected
                    )}
                    onClick={() => this.setState({ selectedIndex: i })}
                  >
                    <img src={child.iconUrl} alt={child.name} />
                  </div>
                ))}
              </div>
            )}
            <div>
              <Button
                variant="contained"
                color="primary"
                disabled={!selected.insertCode}
                onClick={this.handleInsertAssetSelected}
              >
                <Add />
                {localization.editorCard.insert}
              </Button>
              <span className={cn.blank} />
              <Button
                variant="outlined"
                color="primary"
                disabled={!this.filePathToOpenSelected}
                onClick={this.handleOpenFileSelected}
              >
                <Description />
                {localization.editorCard.edit(selected.name)}
              </Button>
            </div>
          </Popover>
        )}
      </>
    )
  }
}
