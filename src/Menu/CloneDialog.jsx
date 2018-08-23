import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import Dialog from 'material-ui/Dialog';
import { Tabs, Tab } from 'material-ui/Tabs';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import CircularProgress from 'material-ui/CircularProgress';
import { Card, CardHeader, CardActions, CardText } from 'material-ui/Card';
import ContentAddCircle from 'material-ui/svg-icons/content/add-circle';
import ActionOpenInBrowser from 'material-ui/svg-icons/action/open-in-browser';
import ActionDelete from 'material-ui/svg-icons/action/delete';
import { brown50, red400 } from 'material-ui/styles/colors';

import {
  personalDB,
  createProject,
  updateProject,
  deleteProject
} from '../database/';
import EditableLabel from '../jsx/EditableLabel';

export default class CloneDialog extends PureComponent {
  static propTypes = {
    resolve: PropTypes.func.isRequired,
    onRequestClose: PropTypes.func.isRequired,
    files: PropTypes.array.isRequired,
    localization: PropTypes.object.isRequired,
    project: PropTypes.object,
    setProject: PropTypes.func.isRequired,
    launchIDE: PropTypes.func.isRequired,
    deployURL: PropTypes.string
  };

  state = {
    error: null,
    projects: null,
    processing: false,
    currentProject: this.props.project,
    // Default show projects same url (origin + pathname)
    showAllUrls: false
  };

  get hasSaved() {
    return !!this.state.currentProject;
  }

  componentDidMount() {
    this.refreshState();
  }

  async refreshState(nextProject) {
    const projects = await personalDB.projects.toArray();
    projects.sort((a, b) => b.updated - a.updated);
    this.setState({
      projects,
      currentProject:
        nextProject ||
        (this.hasSaved
          ? projects.find(item => item.id === this.state.currentProject.id)
          : null)
    });
  }

  handleCreate = async () => {
    if (this.hasSaved) {
      return;
    }
    this.setState({ processing: true });

    try {
      const project = await createProject(
        this.props.files.map(item => item.serialize())
      );
      await this.props.setProject(project);
      await this.refreshState(project);

      const { deployURL } = this.props;
      if (deployURL) {
        await updateProject(project.id, { deployURL });
      }
    } catch (e) {
      console.log(e);
      if (typeof e === 'string' && e in this.props.localization.cloneDialog) {
        alert(this.props.localization.cloneDialog[e]);
      }
    }
    this.setState({ processing: false });
  };

  handleTitleChange = async (project, title) => {
    const { localization } = this.props;

    this.setState({ processing: true });
    try {
      const nextProject = await updateProject(project.id, { title });

      if (this.hasSaved && this.state.currentProject.id === project.id) {
        // Reset current project
        await this.props.setProject(nextProject);
        await this.refreshState(nextProject);
      } else {
        await this.refreshState();
      }
    } catch (e) {
      if (typeof e === 'string') {
        alert(localization.cloneDialog[e]);
      }
    }
    this.setState({ processing: false });
  };

  handleProcessStart = () => {
    this.setState({ processing: true });
  };

  handleProcessEnd = () => {
    this.setState({ processing: false });
    this.refreshState();
  };

  render() {
    const { onRequestClose, localization } = this.props;
    const { currentProject } = this.state;

    const styles = {
      body: {
        padding: 0
      },
      button: {
        marginLeft: 16
      },
      header: {
        marginLeft: 24
      },
      radio: {
        marginBottom: 16
      },
      group: {
        padding: 24
      },
      center: {
        textAlign: 'center'
      },
      container: {
        margin: 16,
        padding: 8,
        paddingBottom: 16,
        height: '20rem',
        overflow: 'scroll',
        backgroundColor: brown50
      },
      card: {
        marginTop: 16
      },
      label: {
        fontWeight: 600,
        marginRight: '1rem'
      }
    };

    const actions = [
      <FlatButton
        key="showAll"
        label={localization.menu.showAllUrls}
        style={styles.button}
        onClick={() =>
          this.setState(prevState => {
            return { showAllUrls: !prevState.showAllUrls };
          })
        }
      />,
      <FlatButton
        key="cancel"
        label={localization.cloneDialog.cancel}
        style={styles.button}
        onClick={onRequestClose}
      />
    ];

    const url = location.origin + location.pathname;
    const projects = (this.state.projects || []).filter(
      project => this.state.showAllUrls || project.url === url
    );

    return (
      <Dialog
        open
        modal={this.state.processing}
        bodyStyle={styles.body}
        actions={actions}
        onRequestClose={onRequestClose}
      >
        <Tabs>
          <Tab label={localization.cloneDialog.saveTitle}>
            <h1 style={styles.header}>{localization.cloneDialog.saveHeader}</h1>
            <div style={styles.container}>
              {this.hasSaved ? (
                [
                  <span key="">{localization.cloneDialog.autoSaved}</span>,
                  <Card key="current" style={styles.card}>
                    <CardHeader
                      title={
                        <EditableLabel
                          id="title"
                          openImmediately={!currentProject.title}
                          defaultValue={currentProject.title}
                          tapTwiceQuickly={localization.common.tapTwiceQuickly}
                          hintText={localization.cloneDialog.setTitle}
                          onEditEnd={text =>
                            this.handleTitleChange(currentProject, text)
                          }
                        />
                      }
                      subtitle={new Date(
                        currentProject.updated
                      ).toLocaleString()}
                    />
                  </Card>
                ]
              ) : (
                <RaisedButton
                  fullWidth
                  key={'new_project'}
                  label={localization.cloneDialog.saveInNew}
                  style={styles.card}
                  icon={<ContentAddCircle />}
                  disabled={this.state.processing}
                  onClick={this.handleCreate}
                />
              )}
            </div>
          </Tab>
          <Tab label={localization.cloneDialog.loadTitle}>
            <h1 style={styles.header}>{localization.cloneDialog.loadHeader}</h1>
            {!this.state.projects ? (
              <div style={{ textAlign: 'center' }}>
                <CircularProgress size={120} />
              </div>
            ) : (
              <div style={styles.container}>
                {projects.map(item => (
                  <ProjectCard
                    key={item.id}
                    project={item}
                    showURL={this.state.showAllUrls}
                    launchIDE={this.props.launchIDE}
                    processing={this.state.processing}
                    onProcessStart={this.handleProcessStart}
                    onProcessEnd={this.handleProcessEnd}
                    requestTitleChange={this.handleTitleChange}
                    requestProjectSet={this.props.setProject}
                    localization={localization}
                  />
                ))}
              </div>
            )}
          </Tab>
        </Tabs>
      </Dialog>
    );
  }
}

export class ProjectCard extends PureComponent {
  static propTypes = {
    project: PropTypes.object.isRequired,
    showURL: PropTypes.bool.isRequired,
    launchIDE: PropTypes.func.isRequired,
    processing: PropTypes.bool.isRequired,
    onProcessStart: PropTypes.func.isRequired,
    onProcessEnd: PropTypes.func.isRequired,
    requestProjectSet: PropTypes.func.isRequired,
    requestTitleChange: PropTypes.func.isRequired,
    localization: PropTypes.object.isRequired
  };

  static defaultProps = {
    showURL: false,
    processing: false,
    onProcessStart: () => {},
    onProcessEnd: () => {},
    requestProjectSet: () => {},
    requestTitleChange: () => {}
  };

  handleLoad = () => {
    return this.props.launchIDE(this.props.project);
  };

  handleRemove = async () => {
    const { project, localization } = this.props;

    if (!confirm(localization.common.cannotBeUndone)) {
      return;
    }

    this.props.onProcessStart();
    try {
      // Delete project and all included files
      await deleteProject(project.id);
      await this.props.requestProjectSet(null);
    } catch (e) {
      alert(localization.cloneDialog.failedToRemove);
    }
    this.props.onProcessEnd();
  };

  render() {
    const { localization, project } = this.props;

    const styles = {
      button: {
        marginLeft: 16
      },
      card: {
        marginTop: 16
      },
      remove: {
        color: red400
      },
      label: {
        fontWeight: 600,
        marginRight: '1rem'
      }
    };

    return (
      <Card key={project.id} style={styles.card}>
        <CardHeader
          showExpandableButton
          title={
            <EditableLabel
              id="title"
              defaultValue={project.title}
              tapTwiceQuickly={localization.common.tapTwiceQuickly}
              onEditEnd={text => this.props.requestTitleChange(project, text)}
            />
          }
          subtitle={[
            moment(project.updated).fromNow(),
            this.props.showURL ? project.url : ''
          ].join(' ')}
        />
        <CardText expandable>
          <div>
            <span style={styles.label}>{localization.cloneDialog.created}</span>
            {new Date(project.created).toLocaleString()}
          </div>
          <div>
            <span style={styles.label}>{localization.cloneDialog.updated}</span>
            {new Date(project.updated).toLocaleString()}
          </div>
          <div>
            <span style={styles.label}>{localization.cloneDialog.size}</span>
            {`${(project.size / 1024 / 1024).toFixed(2)}MB`}
          </div>
        </CardText>
        <CardActions>
          <FlatButton
            label={localization.cloneDialog.openOnThisTab}
            icon={<ActionOpenInBrowser />}
            disabled={this.props.processing}
            onClick={this.handleLoad}
          />
          <FlatButton
            label={localization.cloneDialog.remove}
            icon={<ActionDelete color={red400} />}
            labelStyle={styles.remove}
            disabled={this.props.processing}
            onClick={this.handleRemove}
          />
        </CardActions>
      </Card>
    );
  }
}
