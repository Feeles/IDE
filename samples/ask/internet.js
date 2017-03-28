const API = {
};

const API_KEY = {
};

export default function internet(query) {
  const net = new Internet();
  net.query = query;
  return net;
}

export class Internet {

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
