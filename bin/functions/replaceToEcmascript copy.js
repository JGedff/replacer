const { checkCJCases, addWhileNotFound, checkDefinitionCases, changeEnterToSpace, deleteDefinitionVar } = require('./utils')
const { arrayOfCJCases } = require('../contants/cases')
const replacerFunctions = require('./replacer')
const { fileReader } = require('./reader')

module.exports.getNewFilesEcmascript = (folderSystem, newFileSystem) => {
  folderSystem.forEach((element) => {
    if (typeof (element) === 'object') {
      newFileSystem.push(replacerFunctions.getFilesReplaced(element))
    } else {
      let fileText

      if (element.includes('.js') || element.includes('.jsx')) {
        fileText = this.processToECFile(fileReader(element))
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

module.exports.processToECFile = (file) => {
  let newElement = file
  const checkFile = checkCJCases(file)

  if (checkFile === 0) {
    newElement = replaceCJString(file)

    return this.processToECFile(newElement)
  } else if (checkFile === 1) {
    return newElement
  } else {
    return 'ERROR WHILE REPLACING TEXT'
  }
}

const replaceCJString = (file) => {
  let newElement = file

  arrayOfCJCases.forEach(caseString => {
    while (newElement.indexOf(caseString) !== -1) {
      const index = newElement.indexOf(caseString)
      const overFlow = newElement

      if (caseString === 'module.exports.' || caseString === 'exports.') {
        newElement = newElement.replaceAll('module.exports.', 'export const ').replaceAll('exports.', 'export const ')
      } else if (caseString === 'module.exports = {' || caseString === 'exports = {') {
        newElement = 'EXPORTS = {'
      } else if ((caseString === 'module.exports = ' || caseString === 'exports = ') &&
        !(newElement.substring(index, index + caseString.length + 1) === 'exports = {' ||
        newElement.substring(index, index + caseString.length + 1) === 'module.exports = {')) {
        newElement = 'EXPORTS = '
      } else if (caseString === ' = require(') {
        newElement = 'REQUIRE'
      }

      if (overFlow === newElement) {
        break;
      }
    }
  })

  return newElement
}
