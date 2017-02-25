import React, { PureComponent, PropTypes } from 'react';
import Dialog from 'material-ui/Dialog';
import Table, { TableBody, TableRow, TableRowColumn } from 'material-ui/Table';
import TextField from 'material-ui/TextField';
import FlatButton from 'material-ui/FlatButton';


import { SourceFile } from '../File/';

const getStyles = (props, context) => {

  return {
    left: {
      textAlign: 'right',
    },
  };
};

export default class AboutDialog extends PureComponent {

  static propTypes = {
    onRequestClose: PropTypes.func.isRequired,
    localization: PropTypes.object.isRequired,
    files: PropTypes.array.isRequired,
    getConfig: PropTypes.func.isRequired,
    deployURL: PropTypes.string,
  };

  state = {
    inputSrc: null,
  };

  handleSrcInput = (event) => {
    const inputSrc = event.target.value;
    this.setState({ inputSrc });
  };

  handleChangeSrc = async () => {

    const file = await SourceFile.cdn({
      getConfig: this.props.getConfig,
      files: this.props.files,
      src: this.state.inputSrc,
      deployURL: this.props.deployURL,
    });

    const url = URL.createObjectURL(file.blob);
    location.assign(url);

  };

  render() {
    const {
      onRequestClose,
      localization: { aboutDialog },
    } = this.props;

    const { left } = getStyles(this.props);

    return (
      <div>
        <Dialog open
          title={aboutDialog.title}
          modal={false}
          onRequestClose={onRequestClose}
        >
          <Table selectable={false}>
            <TableBody displayRowCheckbox={false}>
              <TableRow>
                <TableRowColumn style={left}>
                {aboutDialog.coreVersion}
                </TableRowColumn>
                <TableRowColumn>
                {CORE_VERSION}
                </TableRowColumn>
              </TableRow>
              <TableRow>
                <TableRowColumn style={left}>
                {aboutDialog.changeVersion}
                </TableRowColumn>
                <TableRowColumn>
                  <TextField multiLine
                    id="ver"
                    defaultValue={CORE_CDN_URL}
                    onChange={this.handleSrcInput}
                  />
                  <FlatButton primary
                    label={aboutDialog.change}
                    disabled={!this.state.inputSrc}
                    onTouchTap={this.handleChangeSrc}
                  />
                </TableRowColumn>
              </TableRow>
            </TableBody>
          </Table>
        </Dialog>
      </div>
    );
  }
}
