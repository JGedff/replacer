const fs = require('fs-extra');

exports.getDir = (path) => {
    const everything = Array()
    const arrayFiles = fs.readdirSync(path, { withFileTypes: 'false' });

    arrayFiles.forEach((element) => {
        if (fs.lstatSync(path + "/" + element.name).isDirectory()) {
            everything.push(this.readDir(path + "/" + element.name))
        } else {
            everything.push(path + "/" + element.name)
        }
    })

    return everything
}

exports.readDir = (path) => {
    const everything = Array()
    const arrayFiles = fs.readdirSync(path, { withFileTypes: 'false' });

    arrayFiles.forEach((element) => {
        if (fs.lstatSync(path + "/" + element.name).isDirectory()) {
            everything.push(this.readDir(path + "/" + element.name))
        } else {
            everything.push(path + "/" + element.name)
        }
    })

    return everything
}

exports.fileReader = (path) => {
    const file = fs.readFileSync(path, { encoding: 'utf-8' })
    
    return file
}