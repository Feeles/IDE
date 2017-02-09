import React, { PureComponent, PropTypes } from 'react';
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


import {
  personalDB,
  createProject,
  updateProject,
  deleteProject,
} from '../database/';
import { SourceFile } from '../File/';
import EditableLabel from '../jsx/EditableLabel';
import isServiceWorkerEnabled from '../js/isServiceWorkerEnabled';

const BundleTypes = [
  'embed',
  'divide',
  'cdn'
];

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
    setProject: PropTypes.func.isRequired,
    launchIDE: PropTypes.func.isRequired,
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

  componentWillMount() {
    this.refreshState();
  }

  async refreshState(nextProject) {
    const projects = await personalDB.projects.toArray();
    this.setState({
      projects,
      currentProject: nextProject || (this.hasSaved ?
        projects.find(item => item.id === this.state.currentProject.id) :
        null
      ),
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

  handleCreate = async () => {
    if (this.hasSaved) {
      return;
    }
    this.setState({ processing: true });

    try {
      const project = await createProject(
        this.props.files.map((item) => item.serialize())
      );
      await this.props.setProject(project);
      await this.refreshState(project);

    } catch (e) {
      console.log(e);
      if (typeof e === 'string' && e in this.props.localization.cloneDialog) {
        alert(this.props.localization.cloneDialog[e]);
      }

    }
    this.setState({ processing: false });
  };

  handleLoad = async (project, openInNewTab) => {
    const {
      localization,
    } = this.props;

    try {
      if (isServiceWorkerEnabled) {
        if (openInNewTab) {
          const tab = window.open(`../${project.title}/`, '_blank');
          if (!tab) {
            throw new Error(localization.cloneDialog.failedToOpenTab);
          }
        } else {
          location.href = `../${project.title}/`;
        }
      } else {
        await this.props.launchIDE({
          title: project.title
        });
      }
    } catch (e) {
      console.error(e);
      if (e.message) {
        alert(e.message);
      }
    }
  };

  handleRemove = async (project) => {
    const {
      localization,
    } = this.props;

    if (!confirm(localization.common.cannotBeUndone)) {
      return;
    }

    this.setState({ processing: true });
    try {
      // Delete project and all included files
      await deleteProject(project.id);
      await this.props.setProject(null);
      // Update project list
      await this.refreshState();

    } catch (e) {
      console.error(e);
      alert(localization.cloneDialog.failedToRemove);

    }
    this.setState({ processing: false });
  };

  handleTitleChange = async (project, title) => {
    const {
      localization,
    } = this.props;

    this.setState({ processing: true });
    try {
      const nextProject = await updateProject(project.id, { title });

      if (this.hasSaved && this.state.currentProject.id === project.id) {
        // Reset current project
        await this.props.setProject(nextProject);
        await this.refreshState(nextProject);
      }else {
        await this.refreshState();
      }

    } catch (e) {
      console.error(e);
      if (typeof e === 'string') {
        alert(localization.cloneDialog[e]);
      }
    }
    this.setState({ processing: false });
  };

  renderProjectCard(item, styles) {
    const {
      localization,
    } = this.props;

    return (
      <Card
        key={item.id}
        style={styles.card}
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
            disabled={this.state.processing || !isServiceWorkerEnabled}
            onTouchTap={() => this.handleLoad(item, true)}
          />
          <FlatButton
            label={localization.cloneDialog.remove}
            icon={<ActionDelete color={red400} />}
            labelStyle={styles.remove}
            disabled={this.state.processing}
            onTouchTap={() => this.handleRemove(item)}
          />
        </CardActions>
      </Card>
    );
  }

  render() {
    const {
      onRequestClose,
      content,
      localization,
      coreString,
    } = this.props;
    const {
      bundleType,
      currentProject,
    } = this.state;

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
      container: {
        margin: 16,
        padding: 8,
        paddingBottom: 16,
        height: '20rem',
        overflow: 'scroll',
        backgroundColor: brown50,
      },
      card: {
        marginTop: 16,
      },
      remove: {
        color: red400,
      },
      label: {
        fontWeight: 600,
        marginRight: '1rem',
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
            <div style={styles.container}>
            {this.hasSaved ? [
              <span key="">{localization.cloneDialog.autoSaved}</span>,
              <Card
                key="current"
                style={styles.card}
              >
                <CardHeader
                  title={(
                    <EditableLabel id="title"
                      openImmediately
                      defaultValue={currentProject.title}
                      tapTwiceQuickly={localization.common.tapTwiceQuickly}
                      hintText={localization.cloneDialog.setTitle}
                      onEditEnd={(text) => this.handleTitleChange(currentProject, text)}
                    />
                  )}
                  subtitle={new Date(currentProject.updated).toLocaleString()}
                />
              </Card>
            ] : (
              <RaisedButton fullWidth
                key={'new_project'}
                label={localization.cloneDialog.saveInNew}
                style={styles.card}
                icon={<ContentAddCircle />}
                disabled={this.state.processing}
                onTouchTap={this.handleCreate}
              />
            )}
            </div>
          </Tab>
          <Tab label={localization.cloneDialog.loadTitle}>
            <h1 style={styles.header}>{localization.cloneDialog.loadHeader}</h1>
            {!this.state.projects || !this.props.coreString ? (
              <div style={{ textAlign: 'center' }}>
                <CircularProgress size={120} />
              </div>
            ) : (
              <div style={styles.container}>
              {this.state.projects.map((item) => this.renderProjectCard(item, styles))}
              </div>
            )}
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
