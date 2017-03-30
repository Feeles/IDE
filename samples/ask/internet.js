const API = {
  YouTube: 'https://www.googleapis.com/youtube/v3/search',
  YouTubeEmbed: 'http://www.youtube.com/embed',
  Flickr: 'https://api.flickr.com/services/rest',
};

const API_KEY = {
  YouTube: 'AIzaSyAwUCeU11XtFn_LzhJkoyo9Ngq1vw-SwAg',
  Flickr: '8dbc086c0bfa3a0eea4c4977e315f834',
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

  get flickr() {
    return new FlickrResource(this);
  }

}


// インターネット上からリソースを取得、表示するクラスの基底クラス
class Resource {
  constructor(internet) {
    // Internet インスタンスへの参照
    this.internet = internet;
    // face の描画先コンテキスト
    const canvas = document.getElementById('face');
    this.context = canvas && canvas.getContext('2d');
  }

  // レスポンスを JSON で取得
  async get() {
    throw new ReferenceError();
  }

  // MediaCard などのカードにリソースを表示
  async card() {
    throw new ReferenceError();
  }

  // DOM や Canvas などにリソースを表示
  async face() {
    throw new ReferenceError();
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

class FlickrResource extends Resource {
  async get() {
    const response = await this.request(
      API.Flickr,
      {
        method: 'flickr.photos.search',
        api_key: API_KEY.Flickr,
        format: 'json',
        text: this.internet.query,
        nojsoncallback: 1,
        per_page: 1,
      }
    );
    const result = JSON.parse( await response.clone().text() );
    if (!result.stat) {
      await this.debugWindow(response);
    }
    return result;
  }

  async getImage() {
    const {stat, photos} = await this.get();
    const [item] = photos.photo;
    if (item) {
      const response = await this.request(
        `https://farm${item.farm}.staticflickr.com/${item.server}/${item.id}_${item.secret}_z.jpg`
      );
      const blob = await response.blob();
      const image = new Image();
      return new Promise((resolve, reject) => {
        image.addEventListener('load', () => {
          URL.revokeObjectURL(image.src);
          resolve(image);
        });
        image.addEventListener('error', reject);
        image.src = URL.createObjectURL(blob);
      });
    }
    return null;
  }

  async face() {
    if (this.context) {
      const image = await this.getImage();
      const width = Math.min(image.width, this.context.canvas.width);
      const height = Math.min(image.height, this.context.canvas.height);
      this.context.drawImage(image, 0, 0, this.context.canvas.width, this.context.canvas.height);
    }
  }
}
