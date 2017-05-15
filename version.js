const redis = require('redis');
const promisify = require('es6-promisify');

// RedisClient instance and Promised API
const client = redis.createClient({
  url: process.env.REDIS_URL,
  retry_strategy(options) {
    if (options.error && options.error.code === 'ECONNREFUSED') {
      // End reconnecting on a specific error and flush all commands with a individual error
    } else {
      console.log('🚨', options.error);
    }
  }
});
const get = client && promisify(client.get, client);
const set = client && promisify(client.set, client);

// currentVersion の初期値は redis から取得する
// 初期値が取得できる（あるいは失敗する）までは <pending>
const VERSION = 'version';
let currentVersion = get(VERSION).catch(err => '');

// version を 1 すすめる
// e.g. 'v1001' => 'v1002'
const advance = version => {
  if (!version) return 'v1001';
  const n = version.substr(1) >> 0;
  return `v${n + 1}`;
};

// CDN のプレフィックス
const endpoint = 'https://assets.feeles.com/public';
// Interface
module.exports = {
  // 現在のバージョン
  async currentVersion() {
    return (await currentVersion) || '';
  },
  // 現在から 1 すすんだバージョン
  async nextVersion() {
    return advance(await currentVersion);
  },
  // 現在のバージョンを提供する CDN URL
  async currentUrl(pathname = '') {
    return (
      endpoint +
      require('path').join('/', await this.currentVersion(), pathname)
    );
  },
  // 現在から 1 すすんだバージョンを提供する CDN URL
  async nextUrl(pathname = '') {
    return (
      endpoint + require('path').join('/', await this.nextVersion(), pathname)
    );
  },
  // 現在のバージョンを 1 すすめる
  async advance() {
    // currentVersion にはプリミティブな値が入る
    currentVersion = advance(await currentVersion);
    await set(VERSION, currentVersion);
    return currentVersion;
  },
  quit() {
    client.quit();
  }
};
