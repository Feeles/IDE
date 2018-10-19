module.exports = function(content) {
  var moduleName = '';

  if (this.resourceQuery) {
    moduleName = this.resourceQuery.substr(1); // ?module-name
  } else {
    var resourcePath = this.resourcePath; // これをパースして パッケージ名を取り出すしかなさそう
    var fileName = resourcePath.split('node_modules/')[1] || '';
    moduleName = fileName.split('.')[0];
  }

  content = `
define(
    '${moduleName}',
    new Function('require, exports, module', ${JSON.stringify(content)})
);`;

  return `module.exports = ${JSON.stringify(content)}`;
};
module.exports.seperable = true;
