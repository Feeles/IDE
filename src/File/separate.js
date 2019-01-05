import includes from 'lodash/includes'

export default function separate(fullpath) {
  // Filename CAN'T contains spaces.
  fullpath = fullpath.replace(/\s/g, '')
  // Path separator
  fullpath = fullpath.replace(/:/g, '/')
  // Path cannot empty
  fullpath = fullpath.replace(/^\/+/, '')

  const pathLength = fullpath.lastIndexOf('/') + 1
  const path = fullpath.substr(0, pathLength)
  const filename = fullpath.substr(pathLength)

  const plainLength = includes(filename, '.')
    ? filename.lastIndexOf('.')
    : filename.length
  const plain = filename.substr(0, plainLength)
  const ext = filename.substr(plainLength)

  const name = path + plain + ext
  const moduleName = path + plain

  return {
    path,
    plain,
    ext,
    name,
    moduleName
  }
}
