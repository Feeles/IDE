import React, { PureComponent, PropTypes } from 'react';
import Dialog from 'material-ui/Dialog';
import CircularProgress from 'material-ui/CircularProgress';
import { Card, CardHeader, CardActions, CardText } from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import ActionOpenInBrowser from 'material-ui/svg-icons/action/open-in-browser';
import {
  brown50,
} from 'material-ui/styles/colors';


import {
  personalDB,
  createProject,
  updateProject,
  deleteProject,
} from '../database/';

export default class LaunchDialog extends PureComponent {

  static propTypes = {
    open: PropTypes.bool.isRequired,
    localization: PropTypes.object.isRequired,
    launchIDE: PropTypes.func.isRequired,
    launchFromElements: PropTypes.func.isRequired,
    onRequestClose: PropTypes.func.isRequired,
  };

  state = {
    projects: null,
  };

  async componentWillMount() {
    const projects = await personalDB.projects.toArray();

    if (projects.length < 1) {
      this.launchFromElements();
    } else {
      this.setState({
        projects,
      });
    }
  }

  launchIDE({ title }) {
    this.props.onRequestClose();
    this.props.launchIDE({ title });
  }

  launchFromElements = () => {
    this.props.onRequestClose();
    this.props.launchFromElements();
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
          title={item.title}
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
            label={localization.launchDialog.openProject}
            icon={<ActionOpenInBrowser />}
            disabled={this.state.processing}
            onTouchTap={() => this.launchIDE({
              title: item.title,
            })}
          />
        </CardActions>
      </Card>
    );
  }

  renderLoading() {
    return (
      <Dialog modal
        open={this.props.open}
        style={{ textAlign: 'center' }}
      >
        <CircularProgress size={120} />
      </Dialog>
    );
  }

  render() {
    if (!this.state.projects) {
      return this.renderLoading();
    };

    const {
      localization,
    } = this.props;

    const styles = {
      container: {
        margin: 16,
        padding: 8,
        paddingBottom: 16,
        height: '20rem',
        overflow: 'scroll',
        backgroundColor: brown50,
      },
      button: {
        marginLeft: 8,
      },
    };

    return (
      <Dialog modal
        open={this.props.open}
        title={localization.launchDialog.title}
      >
        <div style={styles.container}>
        {this.state.projects.map(this.renderProjectCard, this)}
        </div>
        <div style={{ textAlign: 'center' }}>
        {localization.common.or}
          <RaisedButton primary
            label={localization.launchDialog.startNew}
            style={styles.button}
            onTouchTap={this.launchFromElements}
          />
        </div>
      </Dialog>
    );
  }
}
