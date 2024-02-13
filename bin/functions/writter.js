const fs = require('fs-extra')

const fileDirSystem = []

let directoryCreated = false
let globalSelectedPath = './result'

const writter = (array, fileSystem, selectedPath) => {
  generatePathDirectory(fileSystem, selectedPath)

  writeNewFiles(array, fileSystem)
}

const generatePathDirectory = (fileSystem, selectedPath) => {
  if (!directoryCreated && fileSystem.length > 1) {
    if (selectedPath) {
      globalSelectedPath = selectedPath
    }

    getAllDirs(fileSystem)

    for (let i = 0; i < fileDirSystem.length; i++) {
      const element = fileDirSystem[i]
      const path = element[0].split('/')

      path.splice(path.length - 1, 1)
      fs.mkdirSync(globalSelectedPath + '/' + path.join('/'), { recursive: true })
    }

    directoryCreated = !directoryCreated
  } else {
    fs.mkdirSync(globalSelectedPath, { recursive: true })
  }
}

const getAllDirs = (fileSystem) => {
  let found = false

  fileSystem.forEach(element => {
    if (typeof (element) === 'object') {
      found = true
      getAllDirs(element)
    }
  })

  if (!found) {
    fileDirSystem.push(fileSystem)
  }
}

const writeNewFiles = (array, fileSystem) => {
  if (typeof (array) === 'object') {
    for (let i = 0; i < array.length; i++) {
      const element = array[i]

      if (typeof (element) === 'object') {
        writter(element, fileSystem[i])
      } else {
        fs.writeFileSync(globalSelectedPath + '/' + fileSystem[i], element, { encoding: 'utf8' })
      }
    }
  } else {
    fs.writeFileSync(globalSelectedPath + '/index.js', array, { encoding: 'utf8' })
  }
}

module.exports.default = writter
