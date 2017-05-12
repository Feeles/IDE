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
import ScreenShotCard from './ScreenShotCard/';
import * as MonitorTypes from 'utils/MonitorTypes';

export default class CardContainer extends PureComponent {
  static propTypes = {
    cards: PropTypes.object.isRequired,
    getConfig: PropTypes.func.isRequired,
    updateCard: PropTypes.func.isRequired,
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
    port: PropTypes.object,
    setPort: PropTypes.func.isRequired,
    reboot: PropTypes.bool.isRequired,
    href: PropTypes.string.isRequired,
    coreString: PropTypes.string,
    monitorType: PropTypes.symbol.isRequired,
    toggleFullScreen: PropTypes.func.isRequired,
    togglePopout: PropTypes.func.isRequired,
    saveAs: PropTypes.func.isRequired,
    showNotice: PropTypes.func.isRequired,
    oAuthId: PropTypes.string
  };

  state = {
    // smooth scroll のターゲット
    scrollTarget: null
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
    if (scrollTarget) {
      const rect = scrollTarget.getBoundingClientRect();
      const offset = 16;
      let difference = 0;
      if (rect.left < offset) {
        difference = rect.left - offset;
      } else if (rect.right > window.innerWidth) {
        difference = rect.right - window.innerWidth;
      }

      if (Math.abs(difference) > 1) {
        const sign = Math.sign(difference);
        // smooth scroll
        scrollTarget.parentNode.scrollLeft += difference / 5 + sign * 5;
        requestAnimationFrame(() => {
          this.scroll();
        });
      } else {
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
        height: 0,
        position: 'relative',
        display: 'flex',
        alignItems: 'stretch',
        overflowX: 'scroll',
        overflowY: 'hidden',
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
      visible: this.props.cards[name].visible,
      order: this.props.cards[name].order,
      updateCard: this.props.updateCard,
      scrollToCard: this.scrollToCard,
      cards: this.props.cards,
      showAll: this.props.showAll
    });

    const commonProps = {
      files: this.props.files,
      localization: this.props.localization,
      getConfig: this.props.getConfig,
      setConfig: this.props.setConfig,
      findFile: this.props.findFile,
      addFile: this.props.addFile,
      putFile: this.props.putFile,
      showAll: this.props.showAll
    };
    const cardProps = {
      ...commonProps,
      port: this.props.port,
      selectTab: this.props.selectTab,
      setLocation: this.props.setLocation,
      isPopout: this.props.monitorType === MonitorTypes.Popout,
      togglePopout: this.props.togglePopout,
      toggleFullScreen: this.props.toggleFullScreen,
      deleteFile: this.props.deleteFile,
      deployURL: this.props.deployURL,
      oAuthId: this.props.oAuthId,
      showNotice: this.props.showNotice,
      updateCard: this.props.updateCard
    };
    const editorProps = {
      ...commonProps,
      tabs: this.props.tabs,
      selectTab: this.props.selectTab,
      closeTab: this.props.closeTab,
      setLocation: this.props.setLocation,
      openFileDialog: this.props.openFileDialog,
      port: this.props.port,
      reboot: this.props.reboot,
      href: this.props.href
    };
    const hierarchyProps = {
      ...commonProps,
      tabs: this.props.tabs,
      deleteFile: this.props.deleteFile,
      selectTab: this.props.selectTab,
      closeTab: this.props.closeTab,
      openFileDialog: this.props.openFileDialog,
      saveAs: this.props.saveAs
    };
    const shotProps = {
      ...commonProps,
      port: this.props.port
    };
    const monitorProps = {
      ...commonProps,
      cards: this.props.cards,
      rootWidth: this.rootWidth,
      monitorType: this.props.monitorType,
      isPopout: this.props.monitorType === MonitorTypes.Popout,
      isFullScreen: this.props.monitorType === MonitorTypes.FullScreen,
      togglePopout: this.props.togglePopout,
      toggleFullScreen: this.props.toggleFullScreen,
      reboot: this.props.reboot,
      setPort: this.props.setPort,
      coreString: this.props.coreString,
      saveAs: this.props.saveAs,
      href: this.props.href,
      setLocation: this.props.setLocation
    };

    return (
      <div style={styles.container}>
        <MediaCard
          ref="MediaCard"
          {...cardProps}
          cardPropsBag={bag('MediaCard')}
        />
        <MonitorCard
          ref="MonitorCard"
          {...cardProps}
          monitorProps={monitorProps}
          cardPropsBag={bag('MonitorCard')}
        />
        <PaletteCard
          ref="PaletteCard"
          {...cardProps}
          cardPropsBag={bag('PaletteCard')}
        />
        <EnvCard ref="EnvCard" {...cardProps} cardPropsBag={bag('EnvCard')} />
        <ReadmeCard
          ref="ReadmeCard"
          {...cardProps}
          cardPropsBag={bag('ReadmeCard')}
        />
        <CustomizeCard
          ref="CustomizeCard"
          {...cardProps}
          cardPropsBag={bag('CustomizeCard')}
        />
        <CreditsCard
          ref="CreditsCard"
          {...cardProps}
          cardPropsBag={bag('CreditsCard')}
        />
        <ShotCard
          ref="ShotCard"
          {...cardProps}
          shotProps={shotProps}
          cardPropsBag={bag('ShotCard')}
        />
        <EditorCard
          ref="EditorCard"
          {...cardProps}
          editorProps={editorProps}
          cardPropsBag={bag('EditorCard')}
        />
        <HierarchyCard
          ref="HierarchyCard"
          {...cardProps}
          hierarchyProps={hierarchyProps}
          cardPropsBag={bag('HierarchyCard')}
        />
        <ScreenShotCard
          ref="ScreenShotCard"
          {...cardProps}
          cardPropsBag={bag('ScreenShotCard')}
        />
      </div>
    );
  }
}
