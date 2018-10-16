import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { style } from 'typestyle';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import CircularProgress from '@material-ui/core/CircularProgress';
import Button from '@material-ui/core/Button';
import brown from '@material-ui/core/colors/brown';

import { personalDB, updateProject } from '../database/';
import { ProjectCard } from '../Menu/CloneDialog';

const cn = {
  container: style({
    margin: 16,
    padding: 8,
    paddingBottom: 16,
    height: '20rem',
    overflow: 'scroll',
    backgroundColor: brown['50'],
    overflowX: 'auto',
    overflowY: 'scroll'
  }),
  button: style({
    marginLeft: 8
  })
};

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

  componentDidMount() {
    if (this.props.open) {
      this.refreshState();
    }
  }

  componentDidUpdate(prevProps) {
    if (!prevProps.open && this.props.open) {
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
      await new Promise(resolve => {
        this.setState({ projects }, resolve);
      });
    }
  }

  async launchIDE(project) {
    try {
      await this.props.launchIDE(project);
      this.props.onRequestClose();
    } catch (e) {
      alert(e.message || e);
    }
  }

  handleTitleChange = async (project, title) => {
    const { localization } = this.props;

    try {
      await updateProject(project.id, { title });
      await this.refreshState();
    } catch (e) {
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

    return (
      <Dialog open={this.props.open}>
        <DialogTitle>{localization.launchDialog.title}</DialogTitle>
        <DialogContent style={{ textAlign: 'center' }}>
          <Button
            variant="contained"
            color="primary"
            className={cn.button}
            onClick={this.props.fallback}
          >
            {localization.launchDialog.startNew}
          </Button>
          {localization.common.or}
          <div className={cn.container}>
            {this.state.projects.map(item => (
              <ProjectCard
                key={item.id}
                project={item}
                launchIDE={this.props.launchIDE}
                requestTitleChange={this.handleTitleChange}
                onProcessEnd={() => this.refreshState()}
                localization={localization}
              />
            ))}
          </div>
        </DialogContent>
      </Dialog>
    );
  }
}
