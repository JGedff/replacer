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
    console.error('\x1b[31m', 'The program has stopped.\nA dangerous case has been detected', '\x1b[0m')
    exit(422, new Error('The program has stopped.\nA dangerous case has been detected'))
  } else {
    console.error('\x1b[31m', 'There was a problem when checking the cases to process or dangerous cases', '\x1b[0m')
    exit(500, new Error('There was a problem when checking the cases to process or dangerous cases'))
  }
}

module.exports.prepareCustomCases = (ruleFile) => {
  const file = fileReader(ruleFile)
  const cases = file.split('\n')

  cases.forEach((newCase) => {
    const obj = newCase.split('*')

    if (obj[1] !== undefined) {
      arrayCustomCases.push({ from: obj[0].replaceAll('\n', '').replaceAll('\r', ''), to: obj[1].replaceAll('\n', '').replaceAll('\r', '') })
    } else if (newCase.startsWith('!')) {
      arrayCustomWrongCases.push(newCase.substring(1))
    } else {
      console.error('\x1b[31m', 'The syntax of the custom file is not correct. Please, check the file', '\x1b[0m')
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
