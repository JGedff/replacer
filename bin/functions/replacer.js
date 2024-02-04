const fs = require('fs-extra')

const { getNewFilesEcmascript, processToECFile } = require('./replaceToEcmascript')
const { getNewFilesCommonJs } = require('./replaceToCommonJs')
const { readDir, fileReader } = require('./reader')

module.exports.replacer = (path, moduleType) => {
  let folderSystem

  if (fs.lstatSync(path).isDirectory()) {
    folderSystem = readDir(path)

    const newFileSystem = this.getFilesReplaced(folderSystem, moduleType)

    return newFileSystem
  } else {
    const fileText = fileReader(path)

    if (moduleType === 'commonjs') {
      // return processToCJFile(fileText)
    } else {
      return processToECFile(fileText)
    }
  }
}

module.exports.getFilesReplaced = (folderSystem, moduleType = '') => {
  const newFileSystem = []

  if (moduleType === 'commonjs') {
    getNewFilesCommonJs(folderSystem, newFileSystem, moduleType)
  } else {
    getNewFilesEcmascript(folderSystem, newFileSystem)
  }

  return newFileSystem
}
