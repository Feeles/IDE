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

Internet.prototype.youtube = async function() {
	const response = await this.request(
		API.YouTube, {
			part: 'id',
			type: 'video',
			q: this.query,
			key: API_KEY.YouTube,
			maxResults: 1,
			videoEmbeddable: true,
		}
	);
	const json = await response.text();
	const result = JSON.parse(json);
	const [item] = result.items;
	if (item) {
		await feeles.openMedia({
			url: `${API.YouTubeEmbed}/${item.id.videoId}`,
			playing: true,
			controls: true
		});
	}
};

Internet.prototype.flickr = async function() {
	// search
	const searchResponse = await this.request(
		API.Flickr, {
			method: 'flickr.photos.search',
			api_key: API_KEY.Flickr,
			format: 'json',
			text: this.query,
			nojsoncallback: 1,
			per_page: 1,
		}
	);
	const searchResult = JSON.parse(await searchResponse.clone().text());
	if (!searchResult.stat || !searchResult.photos.photo.length) {
		await this.debugWindow(searchResponse);
	}
	// static image
	const [item] = searchResult.photos.photo;
	const staticResponse = await this.request(
		`https://farm${item.farm}.staticflickr.com/${item.server}/${item.id}_${item.secret}_z.jpg`
	);
	const blob = await staticResponse.blob();
	const fileReader = new FileReader();
	fileReader.onload = e => {
		const image = document.querySelector('.image img');
		const state = document.querySelector('.root').classList;
		image.onload = () => {
			clearTimeout(this.refreshTimer);
			state.add('show-image');
			this.refreshTimer = setTimeout(() => {
				state.remove('show-image');
			}, 4000);
		};
		image.src = e.target.result;
	};
	fileReader.readAsDataURL(blob);
};
