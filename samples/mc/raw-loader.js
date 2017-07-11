// raw-loader: inspired https://github.com/webpack-contrib/raw-loader
export async function load(mapName, localRequire, load, config) {

    const response = await feeles.fetch(mapName);
    const text = await response.text();
    load(text);

}
