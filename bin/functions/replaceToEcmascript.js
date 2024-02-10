const { checkCJCases, addWhileNotFound, replaceDoubleSpaces, checkDefinitionCases, deleteDefinitionVar } = require('./utils')
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
    return replaceExportNamedImportCJ(file, varDefinition, startVar, path, varName)
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

const replaceExportNamedImportCJ = (file, varDefinition, startVar, path, varName) => {
  return file.replace('require', 'req')
}

const replaceExportImportCJ = (file, varDefinition, path) => {
  /* let definitionSubstring = varDefinition
  let toRemove
  let toAdd

  if (file.charAt(file.indexOf(definitionSubstring) - 1) === '.') {
    toRemove = 'module.' + definitionSubstring + ' = require(' + path + ')'
    toAdd = 'export { default } from ' + path
  } else if (definitionSubstring.includes('.')) {
    toRemove = definitionSubstring + ' = require(' + path + ')'
    definitionSubstring = definitionSubstring.replace('exports', '')
    toAdd = 'export ' + definitionSubstring + ' from ' + path
  } else {
    toRemove = definitionSubstring + 's = require(' + path + ')'
    toAdd = 'export ' + definitionSubstring + ' from ' + path
  } */

  return file.replace('require', 'req')
}
