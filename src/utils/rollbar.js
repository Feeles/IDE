import Rollabr from 'rollbar'

let NODE_ENV = 'development'

try {
  NODE_ENV = process.env.NODE_ENV // portal 側で入れてくれる
} catch (error) {
  // 'development' のまま => 通知しない
}

const rollbar = new Rollabr({
  accessToken: '46185b6c483d46bea0cd066075b5cc0e', // [CAUTION] Used in Feeles/IDE as raw string
  captureUncaught: false, // ユーザーのコードを送信するだけなのでキャプチャしない
  captureUnhandledRejections: false, // ユーザーのコードを送信するだけなのでキャプチャしない
  payload: {
    environment: NODE_ENV
  }
})

export const log = (...args) => rollbar && rollbar.log(...args)
export const debug = (...args) => rollbar && rollbar.debug(...args)
export const info = (...args) => rollbar && rollbar.info(...args)
export const warn = (...args) => rollbar && rollbar.warn(...args)
export const warning = (...args) => rollbar && rollbar.warning(...args)
export const error = (...args) => rollbar && rollbar.error(...args)
export const critical = (...args) => rollbar && rollbar.critical(...args)
