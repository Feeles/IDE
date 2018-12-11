import jsyaml from 'js-yaml';
import { flatten, flattenDepth } from 'lodash';

const tryParseYAML = text => {
  try {
    return jsyaml.safeLoad(text);
  } catch (e) {
    return {};
  }
};

/**
 * 旧アセット定義ファイル(YAML)を新仕様に変換する
 */
export default function convertAsset(definitionFileTexts = []) {
  const configs = definitionFileTexts.map(tryParseYAML);
  const scopeNames = flatten(configs.map(def => Object.keys(def)));
  const scopes = scopeNames.map(name => ({
    name: {
      en: name,
      ja: name
    },
    defaultActiveCategory: -1
  }));
  const nullable = value => (value ? value + '' : null);
  const converter = (scope = '') => config => ({
    name: {
      en: nullable(config.label),
      ja: nullable(config.label)
    },
    description: {
      en: nullable(config.description),
      ja: nullable(config.description)
    },
    category: -1,
    iconUrl: nullable(config.image),
    insertCode: nullable(config.code),
    moduleCode: null,
    plan: 'free',
    production: true,
    scopes: [scopeNames.indexOf(scope)],
    filePath: nullable(config.filePath) // 既にあるファイルのパス
  });
  const buttons = flattenDepth(
    configs.map(object =>
      Object.keys(object).map(scope => object[scope].map(converter(scope)))
    ),
    3
  );

  return {
    version: '',
    categories: [],
    scopes: scopes,
    buttons
  };
}
