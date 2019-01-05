export default function findAssetButton(asset, name) {
  return findRecursive(asset.buttons, name)
}

function findRecursive(assetButtons, name) {
  if (!Array.isArray(assetButtons)) return null
  for (const item of assetButtons) {
    if (item.name === name) return item
    const result = findRecursive(item.variations, name)
    if (result) return result
  }
  return null
}
