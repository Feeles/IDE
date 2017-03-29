const API = {
  YouTube: 'https://www.googleapis.com/youtube/v3/search',
  YouTubeEmbed: 'http://www.youtube.com/embed',
};

const API_KEY = {
  YouTube: 'AIzaSyAwUCeU11XtFn_LzhJkoyo9Ngq1vw-SwAg',
};

export default function internet(query) {
  const net = new Internet();
  net.query = query;
  return net;
}

export class Internet {

  get youtube() {
    return new YouTubeResource(this);
  }

}


// インターネット上からリソースを取得、表示するクラスの基底クラス
class Resource {
  constructor(internet) {
    // Internet インスタンスへの参照
    this.internet = internet;
    // face の描画先コンテキスト
    let [canvas] = document.getElementsByTagName('canvas');
    this.context = canvas && canvas.getContext('2d');
  }

  // fetch のラッパー
  async request(api, params = {}) {
    const url = new URL(api);
    url.search = Object.keys(params)
      .map(key => `${key}=${params[key]}`)
      .join('&');
    try {
      this.response = await fetch(url.href);
      if (!this.response.ok) throw response;
      return this.response;
    } catch (e) {
      await this.debugWindow(this.response);
      throw e;
    }
  }

  // レスポンスを新しいウィンドウに表示（デバッグ用）
  async debugWindow(response) {
    if (response instanceof Response) {
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      if (!window.open(url) && confirm('OK')) {
        window.open(url);
      }
      URL.revokeObjectURL(url);
    }
  }
}


class YouTubeResource extends Resource {
  async get() {
    const response = await this.request(
      API.YouTube,
      {
        part: 'id',
        type: 'video',
        q: this.internet.query,
        key: API_KEY.YouTube,
        maxResults: 1,
        videoEmbeddable: true,
      }
    );
    const result = await response.text();
    return JSON.parse(result);
  }

  async card() {
    const {items} = await this.get();

    if (items[0]) {
      await feeles.openMedia({
        url: `${API.YouTubeEmbed}/${items[0].id.videoId}`,
        playing: true,
      });
    }
  }
}
