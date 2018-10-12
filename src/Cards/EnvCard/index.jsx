import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import Card from '../CardWindow';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';

import { SourceFile } from '../../File/';
import EnvItem from './EnvItem';
import EditFile from '../EditFile';

export default class EnvCard extends PureComponent {
  static propTypes = {
    cardPropsBag: PropTypes.object.isRequired,
    files: PropTypes.array.isRequired,
    getConfig: PropTypes.func.isRequired,
    setConfig: PropTypes.func.isRequired,
    localization: PropTypes.object.isRequired,
    findFile: PropTypes.func.isRequired,
    selectTab: PropTypes.func.isRequired,
    addFile: PropTypes.func.isRequired
  };

  state = {
    env: this.props.getConfig('env'),
    fileKey: ''
  };

  componentDidUpdate(prevProps) {
    if (prevProps.files !== this.props.files) {
      const envFile = prevProps.findFile('.env');
      this.setState({
        env: prevProps.getConfig('env'),
        fileKey: envFile ? envFile.key : ''
      });
    }
  }

  componentDidMount() {
    const envFile = this.props.findFile('.env');
    if (!envFile) {
      const env = this.props.getConfig('env');
      this.props.addFile(
        new SourceFile({
          type: 'application/json',
          name: '.env',
          text: JSON.stringify(env, null, '\t')
        })
      );
    } else {
      this.setState({ fileKey: envFile.key });
    }
  }

  handleUpdateEnv = change => {
    const env = Object.assign({}, this.state.env, change);
    this.props
      .setConfig('env', env)
      .then(file => file.json)
      .then(env => this.setState({ env }));
  };

  render() {
    const { localization } = this.props;

    return (
      <Card
        icon={this.props.localization.envCard.title}
        {...this.props.cardPropsBag}
      >
        <CardContent>
          {Object.keys(this.state.env).map(key => (
            <EnvItem
              key={key}
              itemKey={key}
              item={this.state.env[key]}
              localization={localization}
              updateEnv={this.handleUpdateEnv}
            />
          ))}
        </CardContent>
        <CardActions>
          <EditFile
            fileKey={this.state.fileKey}
            findFile={this.props.findFile}
            selectTab={this.props.selectTab}
            localization={localization}
          />
        </CardActions>
      </Card>
    );
  }
}
