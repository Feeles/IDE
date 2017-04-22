import React, { PureComponent, PropTypes } from 'react';
import Card from './CardWindow';
import { CardMedia } from 'material-ui/Card';
import ContentCreate from 'material-ui/svg-icons/content/create';

import EditorPane from '../EditorPane/';
import { Tab } from '../ChromeTab/';

export default class EditorCard extends PureComponent {
  static propTypes = {
    cardPropsBag: PropTypes.object.isRequired,
    editorProps: PropTypes.object.isRequired,
    updateCard: PropTypes.func.isRequired
  };

  static icon() {
    return <ContentCreate color="gray" />;
  }

  // port が渡されることを前提とした実装, 今のままではあまりよくない
  // カード本体の Mount, Update にアクセスできるクラスと、EditorPane を統合すべき
  // でなければ EditorCard が show のときしか port をハンドルできない
  componentWillMount() {
    if (this.props.ShotPane && this.props.editorProps.port) {
      this.handlePort(null, this.props.editorProps.port);
    }
  }

  componentDidMount() {
    // init.fileName があるとき Mount 後に selectTab しておく
    try {
      const { init } = this.props.cardPropsBag.cards.EditorCard;
      if (init && init.fileName) {
        const { selectTab, findFile } = this.props.editorProps;
        const getFile = () => findFile(init.fileName);
        selectTab(new Tab({ getFile }));
      }
    } catch (e) {}
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.editorProps !== nextProps.editorProps) {
      this.handlePort(this.props.editorProps.port, nextProps.editorProps.port);
    }
  }

  handlePort = (prevPort, nextPort) => {
    if (prevPort) {
      prevPort.removeEventListener('message', this.handleMessage);
    }
    if (nextPort) {
      nextPort.addEventListener('message', this.handleMessage);
    }
  };

  // TODO: この辺の処理は共通化した方がよさそう
  handleMessage = event => {
    const { query, value } = event.data || {};
    if (!query) return;

    if (query === 'editor' && value) {
      // feeles.openEditor()
      const getFile = () => this.props.editorProps.findFile(value);
      this.props.editorProps.selectTab(new Tab({ getFile }));
      this.props.updateCard('EditorCard', { visible: true });
    } else if (query === 'editor') {
      // feeles.closeEditor()
      this.props.updateCard('EditorCard', { visible: false });
    }
  };

  render() {
    const { scrollToCard } = this.props.cardPropsBag;
    return (
      <Card
        initiallyExpanded
        icon={EditorCard.icon()}
        {...this.props.cardPropsBag}
      >
        <CardMedia expandable>
          <EditorPane {...this.props.editorProps} scrollToCard={scrollToCard} />
        </CardMedia>
      </Card>
    );
  }
}
