const { arrayOfCJCases, arrayOfCJWrongCases, arrayOfECCases } = require('../contants/cases')
const { arrayVarDefinitions } = require('../contants/variableDefiners')

module.exports.checkCJCases = (element) => {
  let value

  arrayOfCJWrongCases.forEach(wrongCase => {
    if (element.includes(wrongCase)) {
      value = 2
    } else {
      let found = false

      arrayOfCJCases.forEach(caseString => {
        if (element.includes(caseString)) {
          value = 0
          found = true
        }
      })

      if (!found) {
        value = 1
      }
    }
  })

  return value
}

module.exports.checkECCases = (element) => {
  let value

  arrayOfCJWrongCases.forEach(wrongCase => {
    if (element.includes(wrongCase)) {
      value = 2
    } else {
      let found = false

      arrayOfECCases.forEach(caseString => {
        if (element.includes(caseString)) {
          value = 0
          found = true
        }
      })

      if (!found) {
        value = 1
      }
    }
  })

  return value
}

module.exports.addWhileNotFound = (file, character, indexStart) => {
  let newIndex = indexStart

  while (file.charAt(newIndex) !== character) {
    newIndex++
  }

  return newIndex
}

module.exports.changeEnterToSpace = (substring) => {
  return substring.replaceAll('\r', ' ').replaceAll('\n', ' ')
}

module.exports.deleteDefinitionVar = (substring) => {
  let newString = substring

  arrayVarDefinitions.forEach(caseString => {
    if (newString.includes(caseString)) {
      newString = newString.replaceAll(caseString, '')
    }
  })

  return newString
}

module.exports.checkDefinitionCases = (substring) => {
  let found = false

  arrayVarDefinitions.forEach(caseString => {
    if (substring.includes(caseString)) {
      found = true
    }
  })

  return found
}

module.exports.replaceDoubleSpaces = (file) => {
  let fileText = file

  while (fileText.includes('  ')) {
    fileText = fileText.replaceAll('  ', ' ')
  }

  return fileText
}

module.exports.isInsideComment = (file, caseString, index) => {
  let startComment = index
  let foundComment = false
  let finalComment = false
  let initComment = false
  let lineComment = false
  let endComment

  while (!initComment && file.charAt(startComment) !== '') {
    startComment--

    if (file.charAt(startComment) === '/' && file.charAt(startComment - 1) === '/') {
      initComment = true
      lineComment = true
    } else if (file.charAt(startComment) === '*' && file.charAt(startComment - 1) === '/') {
      initComment = true
    }
  }

  endComment = startComment

  if (lineComment) {
    while (!finalComment) {
      endComment++

      if (file.charAt(endComment) === '\n') {
        finalComment = true
      } else if (file.charAt(endComment) === '') {
        break
      }
    }
  } else {
    while (!finalComment) {
      endComment++

      if (file.charAt(endComment) === '*' && file.charAt(endComment + 1) === '/') {
        finalComment = true
      } else if (file.charAt(endComment) === '') {
        break
      }
    }
  }

  if (finalComment && file.substring(startComment, endComment).includes(caseString)) {
    foundComment = true
  }

  return foundComment
}
