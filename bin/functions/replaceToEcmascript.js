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

      if (element.includes('.js') || element.includes('.ts') || element.includes('.jsx') || element.includes('.tsx')) {
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

      if (caseString === 'module.exports.' || caseString === 'exports.') {
        newElement = replaceExportVariableCJ(index, newElement)
      } else if (caseString === ' = require(' || caseString === ' =require(' ||
                caseString === '= require(' || caseString === '=require(') {
        newElement = replaceImportVariableCJ(index, caseString, newElement)
      } else if (caseString === 'module.exports = {' || caseString === 'module.exports ={' ||
                caseString === 'module.exports= {' || caseString === 'module.exports={' ||
                caseString === 'exports = {' || caseString === 'exports ={' ||
                caseString === 'exports= {' || caseString === 'exports={') {
        newElement = replaceExportCJ(caseString, 'export {', newElement, index)
      } else if (caseString === 'module.exports = ' || caseString === 'module.exports =' ||
                caseString === 'module.exports= ' || caseString === 'module.exports=' ||
                caseString === 'exports = ' || caseString === 'exports =' ||
                caseString === 'exports= ' || caseString === 'exports=') {
        newElement = replaceExportCJ(caseString, 'export default ', newElement)
      } else {
        newElement = 'ERROR TRYING TO REPLACE'
      }
    }
  })

  return newElement
}

const replaceExportCJ = (caseString, newString, file, index) => {
  if (caseString.includes('{')) {
    const startExport = addWhileNotFound(file, '{', index)
    const endExport = addWhileNotFound(file, '}', startExport)

    let toAdd = newString

    const toRemove = file.substring(index, endExport + 1)

    const exportObject = file.substring(startExport + 1, endExport)

    const exportValues = exportObject.split(',')

    exportValues.forEach(value => {
      if (value !== '' && value !== '\r\n') {
        if (value.includes(':')) {
          const variable = value.split(':')
          const varDefinition = variable[0].replaceAll('"', '')
          const varValue = variable[1]

          toAdd = 'const ' + varDefinition.replaceAll('\r', '').replaceAll('\n', '') + ' = ' + varValue + '\n' + toAdd + varDefinition + ','
        } else {
          toAdd = toAdd + value + ','
        }
      }
    })

    toAdd = toAdd + '\n}'

    return file.replaceAll(toRemove, toAdd)
  } else {
    return file.replaceAll(caseString, newString)
  }
}

const replaceExportVariableCJ = (index, file) => {
  let caseIndexEnd = index
  let constantIndexEnd

  while (file.charAt(caseIndexEnd - 1) !== 's' || file.charAt(caseIndexEnd) !== '.') {
    caseIndexEnd++
  }

  constantIndexEnd = caseIndexEnd

  while (file.charAt(constantIndexEnd) !== ' ' && file.charAt(constantIndexEnd) !== '=') {
    constantIndexEnd++
  }

  const toRemove = file.substring(index, constantIndexEnd)

  const toAdd = 'export const ' + file.substring(caseIndexEnd + 1, constantIndexEnd).toAdd.replaceAll(':', ' as ')

  return file.replace(toRemove, toAdd)
}

const replaceImportVariableCJ = (index, caseString, file) => {
  let definitionSubstring = ''
  let startPath = index
  let startDefinition = index
  const endDefinition = index
  let requireEnd
  let endPath
  let toRemove
  let toAdd

  while (file.charAt(startPath) !== "'" && file.charAt(startPath) !== '"') {
    startPath++
  }

  endPath = startPath + 1

  while (file.charAt(endPath) !== "'" && file.charAt(endPath) !== '"') {
    endPath++
  }

  requireEnd = endPath + 1
  const path = file.substring(startPath, requireEnd)

  while (!checkDefinitionCases(definitionSubstring)) {
    definitionSubstring = file.substring(startDefinition, endDefinition)

    startDefinition--
  }

  requireEnd = addWhileNotFound(file, ')', requireEnd)

  if (file.charAt(requireEnd + 1) === '.') {
    let varIndex = requireEnd + 2
    let varName = ''

    while (file.charAt(varIndex) !== ' ' && file.charAt(varIndex) !== '\n' && file.charAt(varIndex) !== '') {
      varIndex++
    }

    varName = file.substring(requireEnd + 2, varIndex)

    toRemove = definitionSubstring + caseString + path + ').' + varName

    varName = changeEnterToSpace(varName)

    if (definitionSubstring.includes('{')) {
      toAdd = 'import ' + varName + ' from ' + path + '\n' + definitionSubstring + ' = ' + varName
    } else if (definitionSubstring.trim() === 'exports') {
      if (file.charAt(startDefinition) === '.') {
        toRemove = 'module.' + toRemove
      }

      toAdd = 'import { ' + varName + ' } from ' + path + '\nexport default ' + varName
    } else if (file.substring(startDefinition - 6, endDefinition).includes('export ')) {
      definitionSubstring = deleteDefinitionVar(definitionSubstring)

      toRemove = 'export ' + toRemove
      toAdd = 'import { ' + varName + ' as ' + definitionSubstring + ' } from ' + path + '\nexport const ' + definitionSubstring + ' = ' + definitionSubstring
    } else {
      definitionSubstring = deleteDefinitionVar(definitionSubstring)

      toAdd = 'import { ' + varName + ' as ' + definitionSubstring + ' } from ' + path
    }
  } else {
    if (file.substring(startDefinition - 6, endDefinition).includes('export ')) {
      definitionSubstring = file.substring(startDefinition - 6, endDefinition)
    }

    toRemove = definitionSubstring + caseString + path + ')'

    if (definitionSubstring.trim() === 'exports') {
      if (file.charAt(startDefinition) === '.') {
        toRemove = 'module.' + toRemove
      }

      toAdd = 'import defaultValue from ' + path + '\nexport default defaultValue'
    } else {
      definitionSubstring = deleteDefinitionVar(definitionSubstring)

      toAdd = 'import ' + definitionSubstring + ' from ' + path

      if (file.substring(startDefinition - 6, endDefinition).includes('export ')) {
        toAdd = toAdd + '\nexport const ' + definitionSubstring + ' = ' + definitionSubstring
      }
    }
  }
  toAdd = toAdd.replaceAll(':', ' as ')

  return file.replace(toRemove, toAdd)
}
