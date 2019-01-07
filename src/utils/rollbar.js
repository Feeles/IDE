/* global ROLLBAR_TOKEN, NODE_ENV, GIT_TAG */

import Rollabr from 'rollbar'

const rollbar =
  ROLLBAR_TOKEN &&
  new Rollabr({
    accessToken: ROLLBAR_TOKEN,
    captureUncaught: false, // ユーザーのコードを送信するだけなのでキャプチャしない
    captureUnhandledRejections: false, // ユーザーのコードを送信するだけなのでキャプチャしない
    payload: {
      environment: NODE_ENV,
      codeVersion: GIT_TAG
    }
  })

console.log(rollbar)

export const log = (...args) => rollbar && rollbar.log(...args)
export const debug = (...args) => rollbar && rollbar.debug(...args)
export const info = (...args) => rollbar && rollbar.info(...args)
export const warn = (...args) => rollbar && rollbar.warn(...args)
export const warning = (...args) => rollbar && rollbar.warning(...args)
export const error = (...args) => rollbar && rollbar.error(...args)
export const critical = (...args) => rollbar && rollbar.critical(...args)
