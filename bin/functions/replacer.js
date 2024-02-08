const fs = require('fs-extra')

const { getNewFilesEcmascript, processToECFile } = require('./replaceToEcmascript')
const { getNewFilesCommonJs, processToCJFile } = require('./replaceToCommonJs')
const { readDir, fileReader } = require('./reader')
const { replaceDoubleSpaces } = require('./utils')

module.exports.replacer = (path, moduleType = false) => {
  let folderSystem

  if (fs.lstatSync(path).isDirectory()) {
    folderSystem = readDir(path)

    const newFileSystem = this.getFilesReplaced(folderSystem, moduleType)

    return newFileSystem
  } else {
    const fileText = fileReader(path)
    let newFile

    if (moduleType) {
      newFile = processToCJFile(fileText)
      return replaceDoubleSpaces(newFile)
    } else {
      newFile = processToECFile(fileText)
      return replaceDoubleSpaces(newFile)
    }
  }
}

module.exports.getFilesReplaced = (folderSystem, moduleType = false) => {
  const newFileSystem = []

  if (moduleType) {
    getNewFilesCommonJs(folderSystem, newFileSystem, moduleType)
  } else {
    getNewFilesEcmascript(folderSystem, newFileSystem)
  }

  return newFileSystem
}
