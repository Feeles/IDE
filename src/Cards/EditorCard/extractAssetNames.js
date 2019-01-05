import includes from 'lodash/includes'

const regex = /(rule\.つくる|\S\.しょうかんする|\S\.へんしんする)\(['"]([^'"]+)['"]/g

export default function extractAssetNames(code = '') {
  const assetNames = []
  let result
  regex.lastIndex = 0 // 正規表現のマッチを初期化
  while ((result = regex.exec(code))) {
    const [, , name] = result
    if (name && !includes(assetNames, name)) {
      assetNames.push(name)
    }
  }
  return assetNames
}
