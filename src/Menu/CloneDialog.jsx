import React, { PureComponent, PropTypes } from 'react';
import localforage from 'localforage';
import Dialog from 'material-ui/Dialog';
import {Tabs, Tab} from 'material-ui/Tabs';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import { RadioButton, RadioButtonGroup } from 'material-ui/RadioButton';
import CircularProgress from 'material-ui/CircularProgress';
import { Card, CardHeader, CardActions, CardText } from 'material-ui/Card';
import ContentSave from 'material-ui/svg-icons/content/save';
import ContentAddCircle from 'material-ui/svg-icons/content/add-circle';
import ActionOpenInBrowser from 'material-ui/svg-icons/action/open-in-browser';
import ActionOpenInNew from 'material-ui/svg-icons/action/open-in-new';
import ActionDelete from 'material-ui/svg-icons/action/delete';
import {
  lightBlue100, red100, brown50, red400, fullWhite,
} from 'material-ui/styles/colors';


import { SourceFile } from '../File/';
import EditableLabel from '../jsx/EditableLabel';

const BundleTypes = [
  'embed',
  'divide',
  'cdn'
];

export const KEY_PROJECTS = 'projects';

export default class CloneDialog extends PureComponent {

  static propTypes = {
    resolve: PropTypes.func.isRequired,
    onRequestClose: PropTypes.func.isRequired,
    files: PropTypes.array.isRequired,
    localization: PropTypes.object.isRequired,
    coreString: PropTypes.string,
    saveAs: PropTypes.func.isRequired,
    getConfig: PropTypes.func.isRequired,
    project: PropTypes.object,
    updateProject: PropTypes.func.isRequired,
  };

  state = {
    bundleType: BundleTypes[0],
    error: null,
    projects: null,
    processing: false,
    currentProject: this.props.project,
  };

  get hasSaved() {
    return !!this.state.currentProject;
  }

  async componentWillMount() {
    this.setState({
      projects: await localforage.getItem(KEY_PROJECTS) || [],
    });
  }

  handleClone = async () => {
    switch (this.state.bundleType) {
      case 'embed':

      await this.props.saveAs(
        await SourceFile.embed({
          getConfig: this.props.getConfig,
          files: this.props.files,
          coreString: this.props.coreString,
        })
      );
      this.props.onRequestClose();
      break;

      case 'divide':

      await this.props.saveAs(
        await SourceFile.divide({
          getConfig: this.props.getConfig,
          files: this.props.files,
        })
      );
      break;

      case 'cdn':

      await this.props.saveAs(
        await SourceFile.cdn({
          getConfig: this.props.getConfig,
          files: this.props.files,
        })
      );
      this.props.onRequestClose();
      break;
    }
  };

  handleCloneLibrary = () => {
    this.props.saveAs(SourceFile.library({
      coreString: this.props.coreString,
    }));
  };

  handleCloneAll = async () => {
    const divide = await SourceFile.divide({
      getConfig: this.props.getConfig,
      files: this.props.files,
    });
    const library = await SourceFile.library({
      coreString: this.props.coreString,
    });

    await this.props.saveAs(divide, library);

    this.props.onRequestClose();
  };

  handleBundleTypeChange = (event, bundleType) => {
    this.setState({ bundleType });
  };

  handleCreate = () => {
    if (this.hasSaved) {
      return;
    }
    const identifier = this.props.getConfig('ogp')['og:title'] || '';
    const storeName = `${identifier}@${new Date().getTime()}`;

    return this.handleSave({
      storeName,
      htmlKey: storeName, // Backword compatibility
      title: '',
      created: new Date().getTime(),
    });
  };

  handleSave = async (project) => {
    this.setState({ processing: true });

    const html = await SourceFile.embed({
      getConfig: this.props.getConfig,
      files: this.props.files,
      coreString: this.props.coreString,
    });

    project = {
      ...project,
      size: html.blob.size,
      updated: new Date().getTime(),
      CORE_VERSION,
      CORE_CDN_URL,
    };

    const previous = this.state.projects.find((item) => item.storeName === project.storeName);
    const projects = previous ?
      this.state.projects.map((item) => item === previous ? project : item) :
      [project].concat(this.state.projects);

    try {

      await localforage.setItem(project.htmlKey, html.blob);
      await localforage.setItem(KEY_PROJECTS, projects);

      // File separated store
      const store = localforage.createInstance({
        name: 'projects',
        storeName: project.storeName,
      });
      for (const file of this.props.files) {
        await store.setItem(file.name, file.serialize());
      }

      this.setState({ projects });

    } catch (e) {

      await localforage.removeItem(project.htmlKey);

      alert(this.props.localization.cloneDialog.failedToSave);

    }

    this.setState({ processing: false });

  };

  handleLoad = async (project, openInNewTab) => {
    const tab = openInNewTab ? window.open('', '_blank') : null;
    if (openInNewTab && tab) {
      this.setState({ processing: true });
    }

    const setURL = (url) => {
      if (openInNewTab) {
        if (!tab) {
          alert(this.props.localization.cloneDialog.failedToOpenTab);
          return;
        }
        tab.location.href = url;
        this.setState({ processing: false });
      } else {
        location.href = url;
      }
    };

    // Can I use ServiceWorker proxy?
    if (navigator.serviceWorker &&
      navigator.serviceWorker.controller &&
      navigator.serviceWorker.controller.state === 'activated') {
      // ServiceWorker proxy enabled.

      // Required unique title of project to proxy it
      if (!project.title) {
        alert(this.props.localization.cloneDialog.titleIsRequired);
        return;
      }
      setURL(`${location.origin}/${project.title}/`);
    } else {
      // TODO: Bundle HTML with separated files.
      const blob = await localforage.getItem(project.htmlKey);
      setURL(URL.createObjectURL(blob));
    }
  };

  handleRemove = async (project) => {
    if (!confirm(this.props.localization.common.cannotBeUndone)) {
      return;
    }
    this.setState({ processing: true });

    try {
      // Backword compatibility
      await localforage.removeItem(project.htmlKey);
      // Remove store
      const store = localforage.createInstance({
        name: 'projects',
        storeName: project.storeName,
      });
      await store.clear();
      // Update projects list
      const projects = this.state.projects
        .filter((item) => item.storeName !== project.storeName);

      await localforage.setItem(KEY_PROJECTS, projects);
      this.setState({ projects });

    } catch (e) {
      alert(this.props.localization.cloneDialog.failedToRemove);

    }

    this.setState({ processing: false });
  };

  handleTitleChange = async (project, title) => {
    try {
      this.setState({ processing: true });

      if (this.props.project && this.props.project.storeName === project.storeName) {
        // Modify current project
        await this.props.updateProject({ title })
        this.setState({
          projects: await localforage.getItem(KEY_PROJECTS),
        });
      } else {
        if (this.state.projects.some((item) => item.title === title)) {
          // Same name found.
          throw `${title} is exist.`;
        }
        // Modify others
        const projects = this.state.projects
          .map((item) => {
            if (item.storeName === project.storeName) {
              return {...item, title};
            }
            return item;
          });
        await localforage.setItem(KEY_PROJECTS, projects);
        this.setState({ projects });
      }

    } catch (e) {
      console.error(e);
      alert(this.props.localization.cloneDialog.failedToRename);

    } finally {
      this.setState({ processing: false });

    }
  };

  renderProjectCards(isSave) {
    if (
      !this.state.projects ||
      !this.props.coreString
    ) {
      return (
        <div style={{ textAlign: 'center' }}>
          <CircularProgress size={120} />
        </div>
      );
    }

    const {
      localization,
      project,
    } = this.props;

    const styles = {
      container: {
        margin: 16,
        padding: 8,
        paddingBottom: 16,
        maxHeight: '20rem',
        overflow: 'scroll',
        backgroundColor: brown50,
      },
      card: (current) => ({
        marginTop: 16,
        borderStyle: 'solid',
        borderWidth: 1,
        borderColor: isSave ? lightBlue100 : red100,
        backgroundColor: !current ? fullWhite :
          isSave ? lightBlue100 : red100,
      }),
      remove: {
        color: red400,
      },
      label: {
        fontWeight: 600,
        marginRight: '1rem',
      },
    };

    return (
      <div style={styles.container}>
      {this.hasSaved ? (
        <span>{localization.cloneDialog.autoSaved}</span>
      ) :
      isSave ? (
        <RaisedButton fullWidth
          key={'new_project'}
          label={localization.cloneDialog.saveInNew}
          style={styles.card(false)}
          icon={<ContentAddCircle />}
          disabled={this.state.processing}
          onTouchTap={this.handleCreate}
        />
      ) : null}
      {this.state.projects.map((item, i) => (
        <Card
          key={item.storeName}
          style={styles.card(this.hasSaved && this.state.currentProject.storeName === item.storeName)}
        >
          <CardHeader showExpandableButton
            title={(
              <EditableLabel id="title"
                defaultValue={item.title}
                tapTwiceQuickly={localization.common.tapTwiceQuickly}
                onEditEnd={(text) => this.handleTitleChange(item, text)}
              />
            )}
            subtitle={new Date(item.updated).toLocaleString()}
          />
          <CardText expandable>
            <div>
              <span style={styles.label}>{localization.cloneDialog.created}</span>
              {new Date(item.created).toLocaleString()}
            </div>
            <div>
              <span style={styles.label}>{localization.cloneDialog.updated}</span>
              {new Date(item.updated).toLocaleString()}
            </div>
            <div>
              <span style={styles.label}>{localization.cloneDialog.size}</span>
              {`${(item.size / 1024 / 1024).toFixed(2)}MB`}
            </div>
          </CardText>
        {isSave ? (
          <CardActions>
            <FlatButton
              label={localization.cloneDialog.overwriteSave}
              icon={<ContentSave />}
              disabled={this.state.processing}
              onTouchTap={() => this.handleSave(item)}
            />
            <FlatButton
              label={localization.cloneDialog.remove}
              icon={<ActionDelete color={red400} />}
              labelStyle={styles.remove}
              disabled={this.state.processing}
              onTouchTap={() => this.handleRemove(item)}
            />
          </CardActions>
        ) : (
          <CardActions>
            <FlatButton
              label={localization.cloneDialog.openOnThisTab}
              icon={<ActionOpenInBrowser />}
              disabled={this.state.processing}
              onTouchTap={() => this.handleLoad(item, false)}
            />
            <FlatButton
              label={localization.cloneDialog.openInNewTab}
              icon={<ActionOpenInNew />}
              disabled={this.state.processing}
              onTouchTap={() => this.handleLoad(item, true)}
            />
          </CardActions>
        )}
        </Card>
      ))}
      </div>
    );
  }

  render() {
    const {
      onRequestClose,
      content,
      localization,
      coreString,
    } = this.props;
    const { bundleType } = this.state;

    const styles = {
      body: {
        padding: 0,
      },
      button: {
        marginLeft: 16,
      },
      header: {
        marginLeft: 24,
      },
      radio: {
        marginBottom: 16,
      },
      group: {
        padding: 24,
      },
      center: {
        textAlign: 'center',
      },
    };

    const actions =  [
      <FlatButton
        label={localization.cloneDialog.cancel}
        style={styles.button}
        onTouchTap={onRequestClose}
      />,
    ];

    return (
      <Dialog open
        modal={this.state.processing}
        bodyStyle={styles.body}
        actions={actions}
        onRequestClose={onRequestClose}
      >
        <Tabs>
          <Tab label={localization.cloneDialog.saveTitle}>
            <h1 style={styles.header}>{localization.cloneDialog.saveHeader}</h1>
            {this.renderProjectCards(true)}
          </Tab>
          <Tab label={localization.cloneDialog.loadTitle}>
            <h1 style={styles.header}>{localization.cloneDialog.loadHeader}</h1>
            {this.renderProjectCards(false)}
          </Tab>
          <Tab label={localization.cloneDialog.cloneTitle}>
            <h1 style={styles.header}>{localization.cloneDialog.cloneHeader}</h1>
            <RadioButtonGroup
              name="libType"
              valueSelected={bundleType}
              style={styles.group}
              onChange={this.handleBundleTypeChange}
            >
            {BundleTypes.map((type) => (
              <RadioButton
                key={type}
                value={type}
                label={localization.cloneDialog[type]}
                style={styles.radio}
              />
            ))}
            </RadioButtonGroup>,
          {bundleType === 'divide' ? (
            <div style={styles.center}>
              <RaisedButton primary
                label={localization.cloneDialog.saveHTML}
                style={styles.button}
                onTouchTap={this.handleClone}
              />
              <RaisedButton primary
                label={localization.cloneDialog.saveLibrary}
                disabled={!coreString}
                style={styles.button}
                onTouchTap={this.handleCloneLibrary}
              />
              <RaisedButton primary
                label={localization.cloneDialog.saveAll}
                disabled={!coreString}
                style={styles.button}
                onTouchTap={this.handleCloneAll}
              />
            </div>
          ) : (
            <RaisedButton primary
              label={localization.cloneDialog.save}
              disabled={!coreString}
              style={styles.button}
              onTouchTap={this.handleClone}
            />
          )}
          </Tab>
        </Tabs>
      </Dialog>
    );
  }
}
