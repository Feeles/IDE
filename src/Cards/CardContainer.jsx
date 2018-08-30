import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import MediaCard from './MediaCard/';
import MonitorCard from './MonitorCard/';
import PaletteCard from './PaletteCard/';
import EnvCard from './EnvCard/';
import ReadmeCard from './ReadmeCard/';
import CustomizeCard from './CustomizeCard/';
import CreditsCard from './CreditsCard/';
import ShotCard from './ShotCard/';
import EditorCard from './EditorCard/';
import HierarchyCard from './HierarchyCard/';
import * as MonitorTypes from '../utils/MonitorTypes';

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
    tabs: PropTypes.array.isRequired,
    selectTab: PropTypes.func.isRequired,
    closeTab: PropTypes.func.isRequired,
    setLocation: PropTypes.func.isRequired,
    openFileDialog: PropTypes.func.isRequired,
    reboot: PropTypes.bool.isRequired,
    href: PropTypes.string.isRequired,
    monitorType: PropTypes.symbol.isRequired,
    toggleFullScreen: PropTypes.func.isRequired,
    togglePopout: PropTypes.func.isRequired,
    saveAs: PropTypes.func.isRequired,
    showNotice: PropTypes.func.isRequired,
    globalEvent: PropTypes.object.isRequired
  };

  state = {
    // smooth scroll のターゲット
    scrollTarget: null
  };

  // Card Element の参照を保持するオブジェクト
  cardRefs = {};

  static contextTypes = {
    muiTheme: PropTypes.object.isRequired
  };

  scrollToCard = name => {
    // そのカードにスクロールする
    const scrollTarget = document.getElementById(name);
    if (scrollTarget) {
      const startSmoothScroll = !this.state.scrollTarget;
      this.setState({ scrollTarget }, () => {
        if (startSmoothScroll) {
          this.scroll();
        }
      });
    }
  };

  scroll() {
    // Scroll into view (shallow) element
    const { scrollTarget } = this.state;
    // Is enable transitions?
    const { transitions } = this.context.muiTheme;

    if (scrollTarget) {
      const rect = scrollTarget.getBoundingClientRect();
      const offset = 16;
      let difference = 0;
      if (rect.left < offset) {
        difference = rect.left - offset;
      } else if (rect.right > window.innerWidth) {
        difference = rect.right - window.innerWidth;
      }

      if (transitions.create() !== 'none' && Math.abs(difference) > 1) {
        const sign = Math.sign(difference);
        // smooth scroll
        scrollTarget.parentNode.scrollLeft += difference / 5 + sign * 5;
        requestAnimationFrame(() => {
          this.scroll();
        });
      } else {
        scrollTarget.parentNode.scrollLeft += difference;
        this.setState({ scrollTarget: null });
      }
    }
  }

  render() {
    // (暫定) 背景画像
    const bg =
      this.props.findFile('feeles/background.png') ||
      this.props.findFile('feeles/background.jpg');

    const styles = {
      container: {
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
        backgroundImage: bg && `url(${bg.blobURL})`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        backgroundSize: 'contain'
      }
    };

    const bag = name => ({
      name,
      visible: this.props.cardProps[name].visible,
      order: this.props.cardProps[name].order,
      setCardVisibility: this.props.setCardVisibility,
      scrollToCard: this.scrollToCard,
      cardProps: this.props.cardProps,
      showAll: this.props.showAll
    });

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
      selectTab: this.props.selectTab,
      setLocation: this.props.setLocation,
      isPopout: this.props.monitorType === MonitorTypes.Popout,
      togglePopout: this.props.togglePopout,
      toggleFullScreen: this.props.toggleFullScreen,
      deleteFile: this.props.deleteFile,
      showNotice: this.props.showNotice,
      setCardVisibility: this.props.setCardVisibility,
      tabs: this.props.tabs,
      closeTab: this.props.closeTab,
      openFileDialog: this.props.openFileDialog,
      href: this.props.href,
      scrollToCard: this.scrollToCard,
      cardProps: this.props.cardProps,
      reboot: this.props.reboot,
      saveAs: this.props.saveAs,
      isFullScreen: this.props.monitorType === MonitorTypes.FullScreen
    };

    return (
      <div style={styles.container}>
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
        <EnvCard
          ref={ref => (this.cardRefs.EnvCard = ref)}
          {...commonProps}
          cardPropsBag={bag('EnvCard')}
        />
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
        <CreditsCard
          ref={ref => (this.cardRefs.CreditsCard = ref)}
          {...commonProps}
          cardPropsBag={bag('CreditsCard')}
        />
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
    );
  }
}
