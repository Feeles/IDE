import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import Card from '../CardWindow';

import shallowEqual from '../../utils/shallowEqual';
import uniqueBy from '../../utils/uniqueBy';

export default class CreditsCard extends PureComponent {
  static propTypes = {
    cardPropsBag: PropTypes.object.isRequired,
    files: PropTypes.array.isRequired,
    localization: PropTypes.object.isRequired
  };

  state = {
    credits: this.getCredits()
  };

  componentDidUpdate(prevProps) {
    if (prevProps.files !== this.props.files) {
      const next = this.getCredits();
      if (!shallowEqual(this.state.credits, next)) {
        this.setState({ credits: next });
      }
    }
  }

  getCredits() {
    const credits = this.props.files
      .reduce((p, c) => p.concat(c.credits), [])
      .sort((a, b) => a.timestamp > b.timestamp);

    return uniqueBy(credits, 'label');
  }

  renderCredit(credit) {
    return (
      <div key={credit.hash}>
        {credit.url ? (
          <a href={credit.url} rel="noopener noreferrer" target="_blank">
            {credit.label}
          </a>
        ) : (
          <span>{credit.label}</span>
        )}
      </div>
    );
  }

  render() {
    return (
      <Card
        icon={this.props.localization.creditsCard.title}
        {...this.props.cardPropsBag}
      >
        {this.state.credits.map(this.renderCredit)}
      </Card>
    );
  }
}
