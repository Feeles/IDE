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

  async youtube(params = {}) {
    const response = await this.request(
      API.YouTube,
      {
        part: 'id',
        type: 'video',
        q: this.query,
        key: API_KEY.YouTube,
        maxResults: 1,
        videoEmbeddable: true,
        ...params,
      }
    );
    const result = await response.clone().text();
    const [item] = JSON.parse(result).items;
    if (item) {
      await feeles.openMedia({
        url: `${API.YouTubeEmbed}/${item.id.videoId}`,
        playing: true,
      });
    }
  }

  async request(api, params) {
    const url = new URL(api);
    url.search = Object.keys(params)
      .map(key => `${key}=${params[key]}`)
      .join('&');
    let response;
    try {
      response = await fetch(url.href);
      if (!response.ok) throw response;
      return response;
    } catch (e) {
      await this.debugWindow(response);
      throw e;
    }
  }

  async debugWindow(response) {
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    if (!window.open(url) && confirm('OK')) {
      window.open(url);
    }
    URL.revokeObjectURL(url);
  }
}
