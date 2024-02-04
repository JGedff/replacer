const { arrayOfECCases } = require('../contants/cases')
const replacerFunctions = require('./replacer')
const { fileReader } = require('./reader')
const { checkECCases, addWhileNotFound } = require('./utils')

module.exports.getNewFilesCommonJs = (folderSystem, newFileSystem, moduleType = false) => {
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
  const checkFile = checkECCases(file)

  if (checkFile === 0) {
    newElement = replaceECString(file)

    return this.processToCJFile(newElement)
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
      const index = newElement.indexOf(caseString)

      if (caseString === 'export default ') {
        newElement = file.replaceAll('export default ', 'module.exports = ')
      } else if (caseString === 'export {') {
        newElement = replaceExportECObject(newElement, index)
      } else if (caseString === 'export ') {
        newElement = replaceExportECVar(newElement, index)
      } else if (caseString === 'import ') {
        newElement = replaceImportEC(newElement, index)
      } else {
        newElement = 'ERROR TRYING TO REPLACE'
      }
    }
  })

  return newElement
}

const replaceExportECObject = (newElement, index) => {
  const startObject = addWhileNotFound(newElement, '{', index)
  const endObject = addWhileNotFound(newElement, '{', startObject)
  const toRemove = newElement.substring(index, endObject + 1)
  const toAdd = 'exports = ' + newElement.substring(startObject, endObject + 1).replaceAll(' as ', ': ')

  return newElement.replace(toRemove, toAdd)
}

const replaceExportECVar = (newElement, index) => {
  const startVar = addWhileNotFound(newElement, ' ', index)
  const endVar = addWhileNotFound(newElement, ' ', startVar + 1)

  if (newElement.substring(index, endVar + 1).includes('{')) {
    return replaceExportECObject(newElement, index)
  }

  const toRemove = newElement.substring(index, endVar + 1)
  const toAdd = 'exports.'

  return newElement.replace(toRemove, toAdd)
}

const replaceImportEC = (newElement, index) => {
  const startVal = addWhileNotFound(newElement, ' ', index)

  if (newElement.charAt(startVal + 1) === '{') {
    return replaceImportObject(newElement, index, startVal)
  } /* else if (newElement.charAt(startVal + 1) === '*') {
    return replaceImportAll(newElement, index) Esto sería el import * as name from 'path' => const name = require('path')
  } else {
    return replaceImportDefault(newElement, index) Esto sería el import value from 'path' => const value = require('path').default e import value, { si } from 'path' => const value = require('path').default\nconst { si } = require('path')
  } */ else {
    return newElement.replace('import', 'impert')
  }
}

const replaceImportObject = (newElement, index, startObjIndex) => {
  const endObjIndex = addWhileNotFound(newElement, '}', startObjIndex)
  let startImport = endObjIndex
  let endImport

  while (newElement.charAt(startImport) !== "'" && newElement.charAt(startImport) !== '"') {
    startImport++
  }

  endImport = startImport + 1

  while (newElement.charAt(endImport) !== "'" && newElement.charAt(endImport) !== '"') {
    endImport++
  }

  const toRemove = newElement.substring(index, endImport + 1)
  const toAdd = 'const ' + newElement.substring(startObjIndex, endObjIndex + 1).replaceAll(' as ', ': ') + ' = require(' + newElement.substring(startImport, endImport + 1) + ')'

  return newElement.replace(toRemove, toAdd)
}
