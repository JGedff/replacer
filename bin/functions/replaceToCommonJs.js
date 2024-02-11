const { arrayOfECCases } = require('../contants/cases')
const replacerFunctions = require('./replacer')
const { fileReader } = require('./reader')
const { checkECCases, addWhileNotFound, replaceDoubleSpaces, isInsideComment } = require('./utils')

module.exports.getNewFilesCommonJs = (folderSystem, newFileSystem, moduleType = false) => {
  folderSystem.forEach((element) => {
    if (typeof (element) === 'object') {
      newFileSystem.push(replacerFunctions.getFilesReplaced(element, moduleType))
    } else {
      let fileText

      if (element.includes('.js') || element.includes('.jsx')) {
        fileText = this.processToCJFile(fileReader(element))
      } else {
        fileText = fileReader(element)
      }

      fileText = replaceDoubleSpaces(fileText)

      newFileSystem.push(fileText)
    }
  })
}

module.exports.getNewFilesCommonJsNoComments = (folderSystem, newFileSystem, moduleType = false) => {
  folderSystem.forEach((element) => {
    if (typeof (element) === 'object') {
      newFileSystem.push(replacerFunctions.getFilesReplacedNoComments(element, moduleType))
    } else {
      let fileText

      if (element.includes('.js') || element.includes('.jsx')) {
        fileText = this.processToCJFileNoComments(fileReader(element))
      } else {
        fileText = fileReader(element)
      }

      fileText = replaceDoubleSpaces(fileText)

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

module.exports.processToCJFileNoComments = (file) => {
  let newElement = file
  const checkFile = checkECCases(file)

  if (checkFile === 0) {
    newElement = replaceECString(file, true)

    return this.processToCJFileNoComments(newElement)
  } else if (checkFile === 1) {
    return newElement
  } else {
    return 'ERROR WHILE REPLACING TEXT'
  }
}

const replaceECString = (file, comments = false) => {
  if (comments) {
    return noReplaceECComments(file)
  } else {
    return defaultECReplace(file)
  }
}

const defaultECReplace = (file) => {
  let newElement = file

  arrayOfECCases.forEach(caseString => {
    while (newElement.indexOf(caseString) !== -1) {
      const index = newElement.indexOf(caseString)

      if (caseString === 'export default ') {
        newElement = file.replaceAll('export default ', 'module.exports = ')
      } else if (caseString === 'export {' || newElement.substring(index, index + caseString.length + 1) === 'export {') {
        newElement = replaceExportECObject(newElement, index)
      } else if (caseString === 'export ') {
        newElement = replaceExportECVar(newElement, index)
      } else if (caseString === 'import ') {
        newElement = replaceImportEC(newElement, index)
      }
    }
  })

  return newElement
}

const noReplaceECComments = (file) => {
  let newElement = file
  // const arrayIndexComments = getIndexToSkip(file, arrayOfECCases)

  arrayOfECCases.forEach(caseString => {
    while (newElement.indexOf(caseString) !== -1) {
      // while (newElement.indexOf(caseString) !== -1 && checkNotIn(newElement.indexOf(caseString), arratIndexComments)) {
      const index = newElement.indexOf(caseString)

      if (isInsideComment(newElement, caseString, index)) {
        const toAdd = caseString.substring(1, caseString.length)
        newElement = newElement.replace(caseString, toAdd + ' ')
      } else if (caseString === 'export default ') {
        newElement = newElement.replace('export default ', 'module.exports = ')
      } else if (caseString === 'export {' || newElement.substring(index, index + caseString.length + 1) === 'export {') {
        newElement = replaceExportECObject(newElement, index)
      } else if (caseString === 'export ') {
        newElement = replaceExportECVar(newElement, index)
      } else if (caseString === 'import ') {
        newElement = replaceImportEC(newElement, index)
      }
    }
  })

  return newElement
}

const replaceExportECObject = (newElement, index) => {
  const startObject = addWhileNotFound(newElement, '{', index)
  const endObject = addWhileNotFound(newElement, '}', startObject)

  if (newElement.charAt(endObject + 2) === 'f') {
    return replaceExportImportECObject(newElement, index, startObject, endObject)
  }

  const toRemove = newElement.substring(index, endObject + 1)
  const toAdd = 'module.exports = ' + newElement.substring(startObject, endObject + 1).replaceAll(' as ', ': ')

  return newElement.replace(toRemove, toAdd)
}

const replaceExportImportECObject = (newElement, index, startObject, endObject) => {
  let startPath = endObject

  while (newElement.charAt(startPath) !== '"' && newElement.charAt(startPath) !== "'") {
    startPath++
  }

  let endPath = startPath + 1

  while (newElement.charAt(endPath) !== '"' && newElement.charAt(endPath) !== "'") {
    endPath++
  }

  const toRemove = newElement.substring(index, endPath + 1)

  let obj = newElement.substring(startObject, endObject + 1)

  while (obj.includes(' as ')) {
    const asIndex = obj.indexOf(' as ')

    let indexOldVar = asIndex - 1

    while (obj.charAt(indexOldVar) !== ' ' && obj.charAt(indexOldVar) !== ',' && obj.charAt(indexOldVar) !== '{') {
      indexOldVar--
    }

    const oldVar = obj.substring(indexOldVar, asIndex + 4)

    obj = obj.replace(oldVar, ' ')
  }

  const toAdd = 'import ' + newElement.substring(startObject, endObject + 1) + ' from ' + newElement.substring(startPath, endPath + 1) + '\nexport ' + obj

  return newElement.replace(toRemove, toAdd)
}

const replaceExportECVar = (newElement, index) => {
  const startVar = addWhileNotFound(newElement, ' ', index)
  const endVar = addWhileNotFound(newElement, ' ', startVar + 1)

  if (newElement.substring(index, endVar + 1).includes('*')) {
    return replaceExportImportAll(newElement, index)
  }

  const toRemove = newElement.substring(index, endVar + 1)
  const toAdd = 'exports.'

  return newElement.replace(toRemove, toAdd)
}

const replaceExportImportAll = (newElement, index) => {
  const startName = addWhileNotFound(newElement, 's', index) + 1
  const endName = addWhileNotFound(newElement, ' ', startName + 1)

  let startPath = endName

  while (newElement.charAt(startPath) !== "'" && newElement.charAt(startPath) !== '"') {
    startPath++
  }

  let endPath = startPath + 1

  while (newElement.charAt(endPath) !== "'" && newElement.charAt(endPath) !== '"') {
    endPath++
  }

  const toRemove = newElement.substring(index, endPath + 1)
  const toAdd = 'exports.' + newElement.substring(startName, endName + 1).trim() + ' = require(' + newElement.substring(startPath, endPath + 1) + ')'

  return newElement.replace(toRemove, toAdd)
}

const replaceImportEC = (newElement, index) => {
  const startVal = addWhileNotFound(newElement, ' ', index)

  if (newElement.charAt(startVal + 1) === '{') {
    return replaceImportObject(newElement, index, startVal)
  } else if (newElement.charAt(startVal + 1) === '*') {
    return replaceImportAll(newElement, index)
  } else {
    return replaceImportDefault(newElement, index)
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

const replaceImportAll = (newElement, index) => {
  const startName = addWhileNotFound(newElement, 's', index) + 1
  const endName = addWhileNotFound(newElement, ' ', startName + 1)

  let startPath = endName

  while (newElement.charAt(startPath) !== "'" && newElement.charAt(startPath) !== '"') {
    startPath++
  }

  let endPath = startPath + 1

  while (newElement.charAt(endPath) !== "'" && newElement.charAt(endPath) !== '"') {
    endPath++
  }

  const toRemove = newElement.substring(index, endPath + 1)
  const toAdd = 'const ' + newElement.substring(startName, endName + 1) + ' = require(' + newElement.substring(startPath, endPath + 1) + ')'

  return newElement.replace(toRemove, toAdd)
}

const replaceImportDefault = (newElement, index) => {
  const startVar = addWhileNotFound(newElement, ' ', index)
  const endVar = addWhileNotFound(newElement, ' ', startVar + 1)

  let startPath = endVar + 1
  let endPath

  while (newElement.charAt(startPath) !== "'" && newElement.charAt(startPath) !== '"') {
    startPath++
  }

  endPath = startPath + 1

  while (newElement.charAt(endPath) !== "'" && newElement.charAt(endPath) !== '"') {
    endPath++
  }

  const path = newElement.substring(startPath, endPath + 1)

  if (newElement.substring(startVar, endVar + 1).includes(',')) {
    return replacetDoubleImport(newElement, index, startVar, path, endPath + 1)
  }

  const toRemove = newElement.substring(index, endPath + 1)
  const toAdd = 'const ' + newElement.substring(startVar, endVar + 1) + ' = require(' + path + ')'

  return newElement.replace(toRemove, toAdd)
}

const replacetDoubleImport = (newElement, index, startVar, path, endPath) => {
  const endDefault = addWhileNotFound(newElement, ',', startVar)
  const importDefault = newElement.substring(index, endDefault + 1)
  const endObject = addWhileNotFound(newElement, '}', endDefault)
  const importObj = newElement.substring(endDefault + 1, endObject + 1)
  const addDefault = importDefault.replace(',', ' ') + ' from ' + path + '\nimport ' + importObj + ' from ' + path
  const toRemove = newElement.substring(index, endPath)

  return newElement.replace(toRemove, addDefault.replaceAll('  ', ' '))
}
