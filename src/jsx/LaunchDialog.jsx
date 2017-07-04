import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import Dialog from 'material-ui/Dialog';
import CircularProgress from 'material-ui/CircularProgress';
import { Card, CardHeader, CardActions, CardText } from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import ActionOpenInBrowser from 'material-ui/svg-icons/action/open-in-browser';
import { brown50 } from 'material-ui/styles/colors';

import { personalDB, updateProject } from '../database/';
import EditableLabel from 'jsx/EditableLabel';
import { ProjectCard } from '../Menu/CloneDialog';

export default class LaunchDialog extends PureComponent {
  static propTypes = {
    open: PropTypes.bool.isRequired,
    localization: PropTypes.object.isRequired,
    launchIDE: PropTypes.func.isRequired,
    fallback: PropTypes.func.isRequired,
    onRequestClose: PropTypes.func.isRequired
  };

  static defaultProps = {
    fallback: () => {}
  };

  state = {
    projects: null
  };

  componentWillMount() {
    if (this.props.open) {
      this.refreshState();
    }
  }

  componentWillReceiveProps(nextProps) {
    if (!this.props.open && nextProps.open) {
      this.refreshState();
    }
  }

  async refreshState() {
    const url = location.origin + location.pathname;
    const projects = await personalDB.projects
      .filter(item => item.url === url)
      .toArray();

    if (!projects.length) {
      this.props.fallback();
      this.props.onRequestClose();
    } else {
      projects.sort((a, b) => b.updated - a.updated);
      await new Promise((resolve, reject) => {
        this.setState({ projects }, resolve);
      });
    }
  }

  async launchIDE(project) {
    try {
      await this.props.launchIDE(project);
      this.props.onRequestClose();
    } catch (e) {
      console.error(1, e);
      alert(e.message || e);
    }
  }

  handleTitleChange = async (project, title) => {
    const { localization } = this.props;

    try {
      await updateProject(project.id, { title });
      await this.refreshState();
    } catch (e) {
      console.error(e);
      if (typeof e === 'string') {
        alert(localization.cloneDialog[e]);
      }
    }
  };

  renderLoading() {
    return (
      <Dialog modal open={this.props.open} style={{ textAlign: 'center' }}>
        <CircularProgress size={120} />
      </Dialog>
    );
  }

  render() {
    if (!this.state.projects) {
      return this.renderLoading();
    }

    const { localization } = this.props;

    const styles = {
      container: {
        margin: 16,
        padding: 8,
        paddingBottom: 16,
        height: '20rem',
        overflow: 'scroll',
        backgroundColor: brown50,
        overflowX: 'auto',
        overflowY: 'scroll'
      },
      button: {
        marginLeft: 8
      },
      card: {
        marginTop: 16
      },
      label: {
        fontWeight: 600,
        marginRight: '1rem'
      }
    };

    return (
      <Dialog
        modal
        open={this.props.open}
        title={localization.launchDialog.title}
      >
        <div style={{ textAlign: 'center' }}>
          <RaisedButton
            primary
            label={localization.launchDialog.startNew}
            style={styles.button}
            onTouchTap={this.props.fallback}
          />
          {localization.common.or}
        </div>
        <div style={styles.container}>
          {this.state.projects.map(item =>
            <ProjectCard
              key={item.id}
              project={item}
              launchIDE={this.props.launchIDE}
              requestTitleChange={this.handleTitleChange}
              onProcessEnd={() => this.refreshState()}
              localization={localization}
            />
          )}
        </div>
      </Dialog>
    );
  }
}
