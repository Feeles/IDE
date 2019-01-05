import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { style } from 'typestyle'
import { url } from 'csx'

import MediaCard from './MediaCard/'
import MonitorCard from './MonitorCard/'
import PaletteCard from './PaletteCard/'
// import EnvCard from './EnvCard/';
import ReadmeCard from './ReadmeCard/'
import CustomizeCard from './CustomizeCard/'
// import CreditsCard from './CreditsCard/';
import ShotCard from './ShotCard/'
import EditorCard from './EditorCard/'
import HierarchyCard from './HierarchyCard/'
import * as MonitorTypes from '../utils/MonitorTypes'

const cn = {
  container: style({
    flex: 1,
    position: 'relative',
    display: 'flex',
    flexWrap: 'wrap',
    justfiyContent: 'space-between',
    alignItems: 'stretch',
    overflowX: 'hidden',
    overflowY: 'scroll',
    paddingLeft: 16,
    boxSizing: 'border-box',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    backgroundSize: 'contain'
  })
}

export default class CardContainer extends PureComponent {
  static propTypes = {
    fileView: PropTypes.object.isRequired,
    cardProps: PropTypes.object.isRequired,
    getConfig: PropTypes.func.isRequired,
    loadConfig: PropTypes.func.isRequired,
    setCardVisibility: PropTypes.func.isRequired,
    localization: PropTypes.object.isRequired,
    findFile: PropTypes.func.isRequired,
    showAll: PropTypes.bool.isRequired,
    setConfig: PropTypes.func.isRequired,
    addFile: PropTypes.func.isRequired,
    putFile: PropTypes.func.isRequired,
    deleteFile: PropTypes.func.isRequired,
    files: PropTypes.array.isRequired,
    setLocation: PropTypes.func.isRequired,
    openFileDialog: PropTypes.func.isRequired,
    reboot: PropTypes.bool.isRequired,
    href: PropTypes.string.isRequired,
    monitorType: PropTypes.symbol.isRequired,
    toggleFullScreen: PropTypes.func.isRequired,
    togglePopout: PropTypes.func.isRequired,
    saveAs: PropTypes.func.isRequired,
    showNotice: PropTypes.func.isRequired,
    globalEvent: PropTypes.object.isRequired,
    asset: PropTypes.object
  }

  state = {
    backgroundStyle: {}
  }

  // Card Element の参照を保持するオブジェクト
  cardRefs = {}

  componentDidMount() {
    this.updateBackgroundStyle()
  }

  componentDidUpdate(prevProps) {
    // visible が false から true にかわったらスクロールする
    if (prevProps.cardProps !== this.props.cardProps) {
      for (const name of Object.keys(this.props.cardProps)) {
        const prev = prevProps.cardProps[name]
        const { visible } = this.props.cardProps[name]
        if ((!prev || !prev.visible) && visible) {
          this.scrollToCard(name)
        }
      }
    }
    // 背景画像
    if (prevProps.files !== this.props.files) {
      this.updateBackgroundStyle()
    }
  }

  updateBackgroundStyle() {
    const bg =
      this.props.findFile('feeles/background.png') ||
      this.props.findFile('feeles/background.jpg')
    const backgroundImage = bg ? url(bg.blobURL) : ''
    const { backgroundStyle } = this.state
    if (backgroundStyle.backgroundImage !== backgroundImage) {
      this.setState({
        backgroundStyle: { backgroundImage }
      })
    }
  }

  scrollToCard = name => {
    // そのカードにスクロールする
    const scrollTarget = document.getElementById(name)
    if (scrollTarget) {
      scrollTarget.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'nearest'
      })
    }
  }

  render() {
    const bag = name => ({
      name,
      visible: this.props.cardProps[name].visible,
      order: this.props.cardProps[name].order,
      cardProps: this.props.cardProps,
      showAll: this.props.showAll
    })

    const commonProps = {
      fileView: this.props.fileView,
      files: this.props.files,
      localization: this.props.localization,
      getConfig: this.props.getConfig,
      setConfig: this.props.setConfig,
      loadConfig: this.props.loadConfig,
      findFile: this.props.findFile,
      addFile: this.props.addFile,
      putFile: this.props.putFile,
      showAll: this.props.showAll,
      globalEvent: this.props.globalEvent,
      setLocation: this.props.setLocation,
      isPopout: this.props.monitorType === MonitorTypes.Popout,
      togglePopout: this.props.togglePopout,
      toggleFullScreen: this.props.toggleFullScreen,
      deleteFile: this.props.deleteFile,
      showNotice: this.props.showNotice,
      setCardVisibility: this.props.setCardVisibility,
      openFileDialog: this.props.openFileDialog,
      href: this.props.href,
      scrollToCard: this.scrollToCard,
      cardProps: this.props.cardProps,
      reboot: this.props.reboot,
      saveAs: this.props.saveAs,
      isFullScreen: this.props.monitorType === MonitorTypes.FullScreen,
      asset: this.props.asset
    }

    return (
      <div className={cn.container} style={this.state.backgroundStyle}>
        <MediaCard
          ref={ref => (this.cardRefs.MediaCard = ref)}
          {...commonProps}
          cardPropsBag={bag('MediaCard')}
        />
        <MonitorCard
          ref={ref => (this.cardRefs.MonitorCard = ref)}
          {...commonProps}
          cardPropsBag={bag('MonitorCard')}
        />
        <PaletteCard
          ref={ref => (this.cardRefs.PaletteCard = ref)}
          {...commonProps}
          cardPropsBag={bag('PaletteCard')}
        />
        {/* <EnvCard
          ref={ref => (this.cardRefs.EnvCard = ref)}
          {...commonProps}
          cardPropsBag={bag('EnvCard')}
        /> */}
        <ReadmeCard
          ref={ref => (this.cardRefs.ReadmeCard = ref)}
          {...commonProps}
          cardPropsBag={bag('ReadmeCard')}
        />
        <CustomizeCard
          ref={ref => (this.cardRefs.CustomizeCard = ref)}
          {...commonProps}
          cardPropsBag={bag('CustomizeCard')}
        />
        {/* <CreditsCard
          ref={ref => (this.cardRefs.CreditsCard = ref)}
          {...commonProps}
          cardPropsBag={bag('CreditsCard')}
        /> */}
        <ShotCard
          ref={ref => (this.cardRefs.ShotCard = ref)}
          {...commonProps}
          cardPropsBag={bag('ShotCard')}
        />
        <EditorCard
          ref={ref => (this.cardRefs.EditorCard = ref)}
          {...commonProps}
          cardPropsBag={bag('EditorCard')}
        />
        <HierarchyCard
          ref={ref => (this.cardRefs.HierarchyCard = ref)}
          {...commonProps}
          cardPropsBag={bag('HierarchyCard')}
        />
      </div>
    )
  }
}
