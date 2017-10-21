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
    'og:image': '',
    'og:author': '', // additional
    'og:homepage': '', // additional
    'twitter:card': 'summary_large_image',
    'twitter:site': '',
    'twitter:title': '...',
    'twitter:description': '...',
    'twitter:image': '',
    'twitter:author': ''
  },
  palette: {},
  hashtags: 'hackforplay',
  api: {
    deploy: `${origin}/api/v1/products`,
    thumbnail: `${origin}/api/v1/thumbnails`,
    twitter: `${origin}/oauths/twitter`,
    facebook: `${origin}/oauths/facebook`,
    google: `${origin}/oauths/google`
  }
};
