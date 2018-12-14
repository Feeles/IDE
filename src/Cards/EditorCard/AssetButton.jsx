import React, { PureComponent } from 'react';
import { withTheme } from '@material-ui/core/styles';
import { fade } from '@material-ui/core/styles/colorManipulator';
import PropTypes from 'prop-types';
import { style, classes } from 'typestyle';
import { url } from 'csx';
import Popover from '@material-ui/core/Popover';
import Button from '@material-ui/core/Button';
import ButtonBase from '@material-ui/core/ButtonBase';
import Typography from '@material-ui/core/Typography';
import Add from '@material-ui/icons/Add';
import Description from '@material-ui/icons/Description';
import { moduleDir } from './AssetPane';

const protocols = ['https:', 'http:', 'data:', 'file:', 'blob:'];
const iconSize = 48;

const cn = {
  mainButton: style({
    width: 80,
    height: 80,
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
    position: 'absolute',
    bottom: 0,
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
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
};
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
});

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
    asset: PropTypes.object.isRequired
  };

  static defaultProps = {
    name: '',
    description: ''
  };

  state = {
    anchorEl: null,
    backgroundStyle: {},
    selectedIndex: 0 // 選択中の variation
  };

  get selected() {
    const {
      name,
      description,
      iconUrl,
      insertCode,
      moduleCode,
      filePath,
      variations
    } = this.props;

    return variations
      ? variations[this.state.selectedIndex]
      : {
          name,
          description,
          iconUrl,
          insertCode,
          moduleCode,
          filePath
        };
  }

  get filePathToOpen() {
    // 最初から存在するファイルにアクセス => filePath
    // 追加してからアクセス => asset.module[name]
    const selected = this.selected;
    return (
      selected.filePath ||
      (this.props.asset.module[selected.name]
        ? `${moduleDir}/${selected.name}.js`
        : null)
    );
  }

  handleOpen = event => {
    this.setState({ anchorEl: event.currentTarget });
  };

  handleClose = () => {
    this.setState({ anchorEl: null });
  };

  updateImage() {
    let backgroundImage = '';
    const { iconUrl } = this.selected;

    if (iconUrl) {
      if (protocols.some(p => iconUrl.indexOf(p) === 0)) {
        backgroundImage = url(iconUrl);
      } else {
        const file = this.props.findFile(iconUrl);
        if (file) {
          backgroundImage = url(file.blobURL);
        }
      }
    }
    if (backgroundImage !== this.state.backgroundStyle.backgroundImage) {
      this.setState({
        backgroundStyle: { backgroundImage }
      });
    }
  }

  componentDidMount() {
    this.updateImage();
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.iconUrl !== this.props.iconUrl) {
      this.updateImage();
    } else if (prevState.selectedIndex !== this.state.selectedIndex) {
      this.updateImage();
    }
  }

  handleInsertAsset = () => {
    this.handleClose();
    this.props.insertAsset(this.selected);
  };

  handleOpenFile = () => {
    this.handleClose();
    this.props.openFile({
      name: this.selected.name,
      filePath: this.filePathToOpen
    });
  };

  render() {
    const dcn = getCn(this.props);
    const { localization, variations } = this.props;
    const { selectedIndex } = this.state;
    const selected = this.selected;

    const disableOpenFile = !this.filePathToOpen;

    return (
      <>
        <div className={dcn.root}>
          <ButtonBase
            focusRipple
            className={classes(dcn.button, cn.mainButton)}
            style={this.state.backgroundStyle}
            onClick={this.handleOpen}
          >
            <span className={cn.label}>{selected.name}</span>
          </ButtonBase>
          <div className={cn.actions}>
            <ButtonBase
              focusRipple
              disabled={!selected.insertCode}
              className={classes(dcn.button, cn.iconButton)}
              onClick={this.handleInsertAsset}
            >
              <Add />
            </ButtonBase>
            <ButtonBase
              focusRipple
              disabled={disableOpenFile}
              className={classes(dcn.button, cn.iconButton)}
              onClick={this.handleOpenFile}
            >
              <Description />
            </ButtonBase>
          </div>
        </div>
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
              onClick={this.handleInsertAsset}
            >
              <Add />
              {localization.editorCard.insert}
            </Button>
            <span className={cn.blank} />
            <Button
              variant="outlined"
              color="primary"
              disabled={disableOpenFile}
              onClick={this.handleOpenFile}
            >
              <Description />
              {localization.editorCard.edit(selected.name)}
            </Button>
          </div>
        </Popover>
      </>
    );
  }
}
