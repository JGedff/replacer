const { exit } = require('yargs')

const { checkCJCases, addWhileNotFound, replaceDoubleSpaces, checkDefinitionCases, deleteDefinitionVar, isInsideComment } = require('./utils')
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

      fileText = replaceDoubleSpaces(fileText)

      newFileSystem.push(fileText)
    }
  })
}

module.exports.getNewFilesEcmascriptNoComments = (folderSystem, newFileSystem) => {
  folderSystem.forEach((element) => {
    if (typeof (element) === 'object') {
      newFileSystem.push(replacerFunctions.getFilesReplacedNoComments(element))
    } else {
      let fileText

      if (element.includes('.js') || element.includes('.jsx')) {
        fileText = this.processToECFileNoComments(fileReader(element))
      } else {
        fileText = fileReader(element)
      }

      fileText = replaceDoubleSpaces(fileText)

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
  } else if (checkFile === 2) {
    exit(422, new Error('The program has stopped.\nA dangerous case has been detected'))
  } else {
    exit(500, new Error('There was a problem when checking the cases to process or dangerous cases'))
  }
}

module.exports.processToECFileNoComments = (file) => {
  let newElement = file
  const checkFile = checkCJCases(file)

  if (checkFile === 0) {
    newElement = replaceCJString(file, true)

    return this.processToECFileNoComments(newElement)
  } else if (checkFile === 1) {
    return newElement
  } else {
    return 'ERROR WHILE REPLACING TEXT'
  }
}

const replaceCJString = (file, comments = false) => {
  if (comments) {
    return noReplaceCJComments(file)
  } else {
    return defaultCJReplace(file)
  }
}

const defaultCJReplace = (file) => {
  let newElement = file

  arrayOfCJCases.forEach(caseString => {
    while (newElement.indexOf(caseString) !== -1) {
      const index = newElement.indexOf(caseString)

      if (caseString.includes('require')) {
        newElement = replaceImportVariableCJ(index, newElement)
      } else if (caseString === 'module.exports.' || caseString === 'exports.') {
        newElement = newElement.replaceAll('module.exports.', 'export const ').replaceAll('exports.', 'export const ')
      } else if (caseString === 'module.exports = {' || caseString === 'exports = {') {
        newElement = replaceExportObjCJ(newElement, index)
      } else if ((caseString === 'module.exports = ' || caseString === 'exports = ') &&
        !(newElement.substring(index, index + caseString.length + 1) === 'exports = {' ||
        newElement.substring(index, index + caseString.length + 1) === 'module.exports = {')) {
        newElement = newElement.replaceAll(caseString, 'export default ')
      }
    }
  })

  return newElement
}

const noReplaceCJComments = (file) => {
  let newElement = file

  arrayOfCJCases.forEach(caseString => {
    while (newElement.indexOf(caseString) !== -1) {
      const index = newElement.indexOf(caseString)

      if (isInsideComment(newElement, caseString, index)) {
        const toAdd = caseString.substring(0, caseString.length - 6)
        newElement = newElement.replace(caseString, toAdd + ' ')
      } else if (caseString === ' = require(') {
        newElement = replaceImportVariableCJ(index, newElement)
      } else if (caseString === 'module.exports.' || caseString === 'exports.') {
        newElement = newElement.replaceAll('module.exports.', 'export const ').replaceAll('exports.', 'export const ')
      } else if (caseString === 'module.exports = {' || caseString === 'exports = {') {
        newElement = replaceExportObjCJ(newElement, index)
      } else if ((caseString === 'module.exports = ' || caseString === 'exports = ') &&
        !(newElement.substring(index, index + caseString.length + 1) === 'exports = {' ||
        newElement.substring(index, index + caseString.length + 1) === 'module.exports = {')) {
        newElement = newElement.replaceAll(caseString, 'export default ')
      }
    }
  })

  return newElement
}

const replaceExportObjCJ = (file, index) => {
  const startExport = addWhileNotFound(file, '{', index)
  const endExport = addWhileNotFound(file, '}', startExport)

  let toAdd = 'export {\n'

  const toRemove = file.substring(index, endExport + 1)

  const exportObject = file.substring(startExport + 1, endExport)

  const exportValues = exportObject.split(',')

  exportValues.forEach(value => {
    if (value !== '' && value !== '\r\n') {
      const newValue = value.replaceAll('"', '').replaceAll("'", '').replaceAll('\r', '').replaceAll('\n', '')

      if (newValue.includes(':')) {
        const variable = newValue.split(':')
        const varDefinition = variable[0]
        const varValue = variable[1]

        toAdd = 'const ' + varDefinition + ' = ' + varValue + '\n' + toAdd + varDefinition + ',\n'
      } else {
        toAdd = toAdd + newValue + ',\n'
      }
    }
  })

  toAdd = toAdd + '}'

  return file.replaceAll(toRemove, toAdd)
}

const replaceImportVariableCJ = (index, file) => {
  let definitionSubstring = ''
  let startPath = index
  let startDefinition = index
  let endPath

  while (file.charAt(startPath) !== "'" && file.charAt(startPath) !== '"') {
    startPath++
  }

  endPath = startPath + 1

  while (file.charAt(endPath) !== "'" && file.charAt(endPath) !== '"') {
    endPath++
  }

  while (!checkDefinitionCases(definitionSubstring)) {
    definitionSubstring = file.substring(startDefinition, index)

    startDefinition--
  }

  const path = file.substring(startPath, endPath + 1)

  if (file.charAt(endPath + 2) === '.') {
    return replaceNamedImportCJ(file, definitionSubstring, path, endPath)
  } else {
    return replaceImportCJ(file, definitionSubstring, path)
  }
}

const replaceImportCJ = (file, varDefinition, path) => {
  let definitionSubstring = varDefinition

  if (definitionSubstring.includes('exports')) {
    return replaceExportImportCJ(file, definitionSubstring, path)
  }

  const toRemove = definitionSubstring + ' = require(' + path + ')'

  definitionSubstring = deleteDefinitionVar(definitionSubstring)

  const toAdd = 'import ' + definitionSubstring + ' from ' + path

  return file.replace(toRemove, toAdd)
}

const replaceNamedImportCJ = (file, varDefinition, path, endPath) => {
  let definitionSubstring = varDefinition
  const startVar = endPath + 2
  let endVar = endPath + 2
  let varName = ''

  while (file.charAt(endVar) !== ' ' && file.charAt(endVar) !== '\n' && file.charAt(endVar) !== '') {
    endVar++
  }

  varName = file.substring(startVar + 1, endVar)

  if (varDefinition.includes('exports')) {
    if (file.charAt(file.indexOf(varDefinition) - 1) === '.') {
      return replaceExportNamedImportCJ(file, 'module.' + varDefinition.replaceAll('\n', '').replaceAll('\r', ''), path, varName.replaceAll('\n', '').replaceAll('\r', ''))
    }
  } else if (varDefinition.includes('{')) {
    return replaceObjNamedImportCJ(file, varDefinition, path, varName.replaceAll('\n', '').replaceAll('\r', ''))
  }

  const toRemove = definitionSubstring + ' = require(' + path + ').' + varName

  definitionSubstring = deleteDefinitionVar(definitionSubstring)

  const toAdd = 'import {' + definitionSubstring + ' as ' + varName.replaceAll('\n', '').replaceAll('\r', '') + ' } from ' + path

  return file.replace(toRemove, toAdd)
}

const replaceObjNamedImportCJ = (file, varDefinition, path, varName) => {
  const toRemove = varDefinition + ' = require(' + path + ').' + varName
  const toAdd = 'import ' + varName + ' from ' + path + '\n' + varDefinition + ' = ' + varName

  return file.replace(toRemove, toAdd)
}

const replaceExportNamedImportCJ = (file, varDefinition, path, varName) => {
  if (varDefinition.includes('exports.')) {
    return replaceExportVarNamedImportCJ(file, varDefinition, path, varName)
  }

  const toRemove = varDefinition + ' = require(' + path + ').' + varName
  const toAdd = 'import ' + varName + ' from ' + path + '\nexport default ' + varName

  return file.replace(toRemove, toAdd)
}

const replaceExportVarNamedImportCJ = (file, varDefinition, path, varName) => {
  const toRemove = varDefinition + ' = require(' + path + ').' + varName
  const definitionSubstring = varDefinition.replaceAll('module.exports.', '').replaceAll('module.exports', '').replaceAll('exports.', '').replaceAll('exports', '')
  const toAdd = 'import ' + varName + ' from ' + path + '\nexport const ' + definitionSubstring + ' = ' + varName

  return file.replace(toRemove, toAdd)
}

const replaceExportImportCJ = (file, varDefinition, path) => {
  const definitionSubstring = varDefinition

  if (file.charAt(file.indexOf(definitionSubstring) - 1) === '.') {
    return replaceExportDefaultImportCJ(file, definitionSubstring, path)
  } else if (definitionSubstring.includes('.')) {
    return replaceExportVarInputCJ(file, definitionSubstring, path)
  }

  const toRemove = definitionSubstring + 's = require(' + path + ')'
  const toAdd = 'export ' + definitionSubstring + ' from ' + path

  return file.replace(toRemove, toAdd)
}

const replaceExportDefaultImportCJ = (file, definitionSubstring, path) => {
  const toRemove = 'module.' + definitionSubstring + ' = require(' + path + ')'
  const toAdd = 'import defaultValue from ' + path + '\nexport default defaultValue'

  return file.replace(toRemove, toAdd)
}

const replaceExportVarInputCJ = (file, varDefinition, path) => {
  const toRemove = varDefinition + ' = require(' + path + ')'
  const definitionSubstring = varDefinition.replace('exports', '')
  const toAdd = 'import ' + definitionSubstring + ' from ' + path + '\nexport ' + definitionSubstring

  return file.replace(toRemove, toAdd)
}
