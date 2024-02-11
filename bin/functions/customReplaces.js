const { exit } = require('yargs')

const { fileReader } = require('./reader')
const { replaceDoubleSpaces, checkCustomCases } = require('./utils')

const arrayCustomCases = []
const arrayCustomWrongCases = []

module.exports.getFilesCustomReplaced = (folderSystem) => {
  folderSystem.forEach((element) => {
    if (typeof (element) === 'object') {
      return this.getFilesCustomReplaced(element)
    } else {
      let fileText

      if (element.includes('.js') || element.includes('.jsx')) {
        fileText = this.porcessCustomFile(fileReader(element))
      } else {
        fileText = fileReader(element)
      }

      return replaceDoubleSpaces(fileText)
    }
  })
}

module.exports.porcessCustomFile = (file) => {
  let newElement = file
  const checkFile = checkCustomCases(file, arrayCustomCases, arrayCustomWrongCases)

  if (checkFile === 0) {
    newElement = replaceCustomString(file, arrayCustomCases)

    return this.porcessCustomFile(newElement)
  } else if (checkFile === 1) {
    return newElement
  } else if (checkFile === 2) {
    exit(422, new Error('The program has stopped.\nA dangerous case has been detected'))
  } else {
    exit(500, new Error('There was a problem when checking the cases to process or dangerous cases'))
  }
}

module.exports.prepareCustomCases = (ruleFile) => {
  const cases = ruleFile.split('\n')

  cases.forEach((newCase) => {
    const obj = newCase.split('*')

    if (obj[1] !== undefined) {
      arrayCustomCases.push({ from: obj[0], to: obj[1] })
    } else if (newCase.startsWith('!')) {
      arrayCustomWrongCases.push(newCase)
    } else {
      exit(400, new Error('The syntax of the custom file is not correct. Please, check the file'))
    }
  })
}

const replaceCustomString = (file, arrayCustom) => {
  let newFile = file

  arrayCustom.forEach((objCustom) => {
    newFile = newFile.replace(objCustom.from, objCustom.to)
  })

  return newFile
}
