const fs = require('fs-extra')
let directoryCreated = false
let fileDirSystem = Array()
let globalSelectedPath

const writter = (array, fileSystem, selectedPath) => {
    if (!directoryCreated) {
        selectedPath ? globalSelectedPath = selectedPath : globalSelectedPath = './result'

        console.log('The files will be on the folder: ' + globalSelectedPath)

        getAllDirs(fileSystem)

        for (let i = 0; i < fileDirSystem.length; i++) {
            const element = fileDirSystem[i];
            let path = element[0].split('/')

            path.splice(path.length - 1, 1)
            fs.mkdirSync(globalSelectedPath + '/' + path.join('/'), { recursive: true })
        }

        directoryCreated = !directoryCreated
    }

    if (typeof (array) === 'object') {
        for (let i = 0; i < array.length; i++) {
            const element = array[i];
            
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

const getAllDirs = (fileSystem) => {
    let found = false

    fileSystem.forEach(element => {
        if (typeof (element) === 'object') {
            found = true
            getAllDirs(element)
        }
    });

    if (!found) {
        fileDirSystem.push(fileSystem)
    }
}

module.exports.default = writter