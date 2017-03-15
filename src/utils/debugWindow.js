/**
 * Display web page acquired by fetch API in new windowShow website
 */
export default async function debugWindow(response) {
  if (process.env.NODE_ENV !== 'production') {

    const url = URL.createObjectURL(await response.clone().blob());
    if (window.open(url) === undefined && confirm('Display page?')) {
      // Try opening the window again
      if (window.open(url) === undefined) {
        console.error('debugWindow: Failed to open window! See raw response', response);
      }
    }

  }
}
