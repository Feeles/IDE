import React, { Component, PropTypes } from 'react';
import HTML5Backend from 'react-dnd-html5-backend';
import TouchBackend from 'react-dnd-touch-backend';
import { DragDropContext } from 'react-dnd';
import localforage from 'localforage';
import { grey100, grey500 } from 'material-ui/styles/colors';


import {
  makeFromElement,
  BinaryFile,
  SourceFile,
  validateType
} from '../File/';
import Main from './Main';

class RootComponent extends Component {

  static propTypes = {
    rootElement: PropTypes.object.isRequired,
    project: PropTypes.string,
    inlineScriptId: PropTypes.string,
  };

  state = {
    last: Infinity,
    files: [],
    localforageInstance: null,
  };

  setStatePromise(nextState) {
    return new Promise((resolve, reject) => {
      this.setState(nextState, resolve);
    });
  }

  async componentWillMount() {
    const {
      project,
      rootElement,
    } = this.props;

    if (typeof project === 'string') {
      // From localforage
      this.launchIDE({ project });

    } else {
      // from script elements
      const query = rootElement.getAttribute('data-target');
      const elements = document.querySelectorAll(`script${query}`);
      this.setState({
        last: elements.length,
      });

      for (const item of Array.from(elements)) {
        this.progress(await makeFromElement(item));
        if (Math.random() < 0.1 || this.state.last === 1) {
          await this.wait();
        }
      }

    }
  }

  launchIDE = async ({ project }) => {
    const store = localforage.createInstance({
      name: 'projects',
      storeName: project,
    });

    this.setState({
      last: await store.length(),
      files: [],
      localforageInstance: store,
    });

    await store.iterate((value, key) => {
      if (validateType('blob', value.type)) {
        this.progress(new BinaryFile(value));
      } else {
        this.progress(new SourceFile(value));
      }
    });
  };

  wait() {
    return new Promise((resolve, reject) => {
      requestAnimationFrame(resolve);
    });
  }

  progress(file) {
    this.setState((prevState) => {
      return {
        last: prevState.last - 1,
        files: prevState.files.concat(file),
      };
    });
  }

  renderLoading = () => {
    const {
      last,
      files,
    } = this.state;

    const styles = {
      root: {
        display: 'flex',
        width: '100%',
        height: '100%',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: grey100,
        fontFamily: 'cursive',
      },
      header: {
        fontWeight: 100,
        color: 'white',
      },
      count: {
        fontSize: '.5rem',
        color: grey500,
      },
    };

    return (
      <div style={styles.root}>
        <h1 style={styles.header}>Feeles</h1>
      {last < Infinity ? (
        <span key="0" style={styles.count}>
          {'='.repeat(files.length) + '+' + '-'.repeat(last - 1)}
        </span>
      ) : null}
      </div>
    );
  };

  render() {
    if (this.state.last > 0) {
      return this.renderLoading();
    }

    const {
      rootElement,
    } = this.props;

    return (
      <Main
        files={this.state.files}
        rootElement={rootElement}
        rootStyle={getComputedStyle(rootElement)}
        localforageInstance={this.state.localforageInstance}
        launchIDE={this.launchIDE}
      />
    );
  }
}


const dndBackend = 'ontouchend' in document ? TouchBackend : HTML5Backend;
export default DragDropContext(dndBackend)(RootComponent);
