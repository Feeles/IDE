import React, { Component, PropTypes } from 'react';
import HTML5Backend from 'react-dnd-html5-backend';
import TouchBackend from 'react-dnd-touch-backend';
import { DragDropContext } from 'react-dnd';
import { grey100, grey500 } from 'material-ui/styles/colors';


import {
  readProject,
} from '../database/';
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
    // A string as title of project opened
    title: PropTypes.string,
    inlineScriptId: PropTypes.string,
  };

  state = {
    last: Infinity,
    files: [],
    // An object has project info
    project: null,
  };

  setStatePromise(nextState) {
    return new Promise((resolve, reject) => {
      this.setState(nextState, resolve);
    });
  }

  componentWillMount() {
    const {
      title,
    } = this.props;

    if (typeof title === 'string') {
      // From indexedDB
      this.launchIDE({ title });
    } else {
      this.launchFromElements();
    }
  }

  launchIDE = async ({ title }) => {
    const {
      project,
      query,
      length,
    } = await readProject(title);

    this.setState({
      last: length,
      files: [],
      project,
    });

    query.each(value => {
      const seed = value.serializedFile;
      if (validateType('blob', seed.type)) {
        this.progress(new BinaryFile(seed));
      } else {
        this.progress(new SourceFile(seed));
      }
    });
  };

  async launchFromElements() {
    // from script elements
    const query = this.props.rootElement.getAttribute('data-target');
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
        color: grey500,
        fontSize: '.5rem',
        fontFamily: 'Consolas, "Liberation Mono", Menlo, Courier, monospace',
        wordBreak: 'break-all',
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
        project={this.state.project}
        launchIDE={this.launchIDE}
      />
    );
  }
}


const dndBackend = 'ontouchend' in document ? TouchBackend : HTML5Backend;
export default DragDropContext(dndBackend)(RootComponent);
