import includes from 'lodash/includes';

export default function separate(fullpath) {
  // Filename CAN'T contains spaces.
  fullpath = fullpath.replace(/\s/g, '');
  // Path separator
  fullpath = fullpath.replace(/:/g, '/');
  // Path cannot empty
  fullpath = fullpath.replace(/^\/+/, '');

  const pathLength = fullpath.lastIndexOf('/') + 1;
  const path = fullpath.substr(0, pathLength);
  const filename = fullpath.substr(pathLength);

  const planeLength = includes(filename, '.')
    ? filename.lastIndexOf('.')
    : filename.length;
  const plane = filename.substr(0, planeLength);
  const ext = filename.substr(planeLength);

  const name = path + plane + ext;
  const moduleName = path + plane;

  return {
    path,
    plane,
    ext,
    name,
    moduleName
  };
}
