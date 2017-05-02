let origin = 'http://localhost:8000';
// let origin = 'https://www.feeles.com';
if (process.env.NODE_ENV === 'production') {
  origin = 'https://www.feeles.com';
}

export default {
  title: 'HackforPlay',
  placeholder: {
    'og:title': '',
    'og:url': '',
    'og:description': '',
    'og:image': 'https://embed.hackforplay.xyz/open-source/ogp/WQs5wGAvvnO8NJdlFHtd1zLimS0ollWf.png',
    'og:image:width': 480,
    'og:image:height': 320,
    'og:author': '', // additional
    'og:homepage': '', // additional
    'twitter:card': 'summary_large_image',
    'twitter:site': '',
    'twitter:title': '...',
    'twitter:description': '...',
    'twitter:image': 'https://embed.hackforplay.xyz/open-source/ogp/WQs5wGAvvnO8NJdlFHtd1zLimS0ollWf.png',
    'twitter:author': ''
  },
  images: [
    'https://embed.hackforplay.xyz/open-source/ogp/WQs5wGAvvnO8NJdlFHtd1zLimS0ollWf.png',
    'https://embed.hackforplay.xyz/open-source/ogp/VUeOuXf5Lo0PepdqalINiVraCUTpfJ8V.png',
    'https://embed.hackforplay.xyz/open-source/ogp/vveWeYwVjeU7fj4Y22jpnlDBxQJpugme.png',
    'https://embed.hackforplay.xyz/open-source/ogp/wwdaiseDGHw8lS3SedaXjFczMEMq63GJ.png',
    'https://embed.hackforplay.xyz/open-source/ogp/Y109KU1wE4CyTM9MNFQMQR3PMYRSjb6A.png',
    'https://embed.hackforplay.xyz/open-source/ogp/x1dQ6aq3uLrXgmaDWWSB4K5fDlM4IE9T.png',
    'https://embed.hackforplay.xyz/open-source/ogp/Z0yCmf7BVwooyR4utctOnxlijUl7g235.png',
    'https://embed.hackforplay.xyz/open-source/ogp/xC6Xnuacrj9vnvyyLjKUvDGIpugdZnK8.png',
    'https://embed.hackforplay.xyz/open-source/ogp/ZE18NZ2uqdgNNRXJvqjnaJI4DqnElKDD.png',
    'https://embed.hackforplay.xyz/open-source/ogp/yzsPOWsudxmxziPpP8ftcRyziFVZ3sJG.png',
    'https://embed.hackforplay.xyz/open-source/ogp/ZTVGl3XmGpfD6BF1izJq8PGp5GzpqJi4.png',
    'https://embed.hackforplay.xyz/open-source/ogp/zYqZHmMVVeXOs19WmhrYRyimuKf58YWB.png',
    'https://embed.hackforplay.xyz/open-source/ogp/vTLBZ4zUTMiJlOEeHjFogiufdVxIR0Ch.png'
  ],
  palette: {},
  hashtags: 'hackforplay',
  api: {
    deploy: `${origin}/api/v1/products`,
    thumbnail: `${origin}/api/v1/thumbnails`,
    twitter: `${origin}/oauths/twitter`,
    line: `${origin}/oauths/line`,
    facebook: `${origin}/oauths/facebook`,
    google: `${origin}/oauths/google`
  }
};
