const { arrayOfECCases } = require('../contants/cases')
const replacerFunctions = require('./replacer')
const { fileReader } = require('./reader')
const { checkCases } = require('./utils')

module.exports.getNewFilesCommonJs = (folderSystem, newFileSystem, moduleType) => {
  folderSystem.forEach((element) => {
    if (typeof (element) === 'object') {
      newFileSystem.push(replacerFunctions.getFilesReplaced(element, moduleType))
    } else {
      let fileText

      if (element.includes('.js') || element.includes('.ts') || element.includes('.jsx') || element.includes('.tsx')) {
        fileText = this.processToCJFile(fileReader(element))
      } else {
        fileText = fileReader(element)
      }

      while (fileText.includes('  ')) {
        fileText = fileText.replaceAll('  ', ' ')
      }

      newFileSystem.push(fileText)
    }
  })
}

module.exports.processToCJFile = (file) => {
  let newElement = file
  const checkFile = checkCases(file)

  if (checkFile === 0) {
    newElement = replaceECString(file)

    return this.processToECFile(newElement)
  } else if (checkFile === 1) {
    return newElement
  } else {
    return 'ERROR WHILE REPLACING TEXT'
  }
}

const replaceECString = (file) => {
  let newElement = file

  arrayOfECCases.forEach(caseString => {
    while (newElement.indexOf(caseString) !== -1) {
      if (caseString === 'module.exports.' || caseString === 'exports.') {

      } else {
        newElement = 'ERROR TRYING TO REPLACE'
      }
    }
  })

  return newElement
}
