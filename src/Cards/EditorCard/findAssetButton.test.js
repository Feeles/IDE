import test from 'ava'
import asset from '../../../assets/beta-1.json'
import findAssetButton from './findAssetButton'

const exists = ['赤色のスライム', 'プレイヤー']

const notExists = ['スライム', '', null, undefined]

test('findAssetButton', t => {
  for (const name of exists) {
    t.not(findAssetButton(asset, name), null, `${name} is not exist`)
  }
  for (const name of notExists) {
    t.is(findAssetButton(asset, name), null, `${name} is exist`)
  }
})
