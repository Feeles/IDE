import React, { PureComponent, PropTypes } from 'react';
import { Card, CardHeader, CardActions, CardMedia } from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';


import Monitor from '../Monitor/';
import { commonRoot } from './commonStyles';
import { SizerWidth } from '../jsx/Sizer';

export default class MonitorCard extends PureComponent {

  static propTypes = {
    rootWidth: PropTypes.number.isRequired,
    monitorWidth: PropTypes.number.isRequired,
    isResizing: PropTypes.bool.isRequired,
    files: PropTypes.array.isRequired,
    reboot: PropTypes.bool.isRequired,
    href: PropTypes.string.isRequired,
    portRef: PropTypes.func.isRequired,
    localization: PropTypes.object.isRequired,
    getConfig: PropTypes.func.isRequired,
    addFile: PropTypes.func.isRequired,
    findFile: PropTypes.func.isRequired,
    putFile: PropTypes.func.isRequired,
    coreString: PropTypes.string,
    saveAs: PropTypes.func.isRequired,
    setLocation: PropTypes.func.isRequired,
  };

  static contextTypes = {
    muiTheme: PropTypes.object.isRequired,
  };

  state = {
    size: this.size,
  };

  get size() {
    return (this.props.rootWidth - this.props.monitorWidth - SizerWidth) / 4 * 3;
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (this.props.isResizing && nextProps.isResizing) {
      return false;
    }

    return true;
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      size: this.size,
    });
  }

  handleExpandChange = (expand) => {
    if (expand) {
      this.props.setLocation();
    }
  };

  render() {
    const {
       localization,
    } = this.props;

    const styles = {
      root: {
        ...commonRoot,
      },
      media: {
        display: 'flex',
        width: '100%',
        height: this.state.size,
      },
    };

    const monitorProps = {
      ...this.props,
      monitorWidth: this.state.size,
      monitorHeight: this.state.size,
    };

    return (
      <Card
        initiallyExpanded
        style={styles.root}
        onExpandChange={this.handleExpandChange}
      >
        <CardHeader showExpandableButton actAsExpander
          title={localization.monitorCard.title}
        />
        <CardMedia expandable
          mediaStyle={styles.media}
        >
          <Monitor {...monitorProps} />
        </CardMedia>
      </Card>
    );
  }
}
