#!/usr/bin/env node

const yargs = require('yargs')
const fs = require('fs-extra')

const writter = require('./functions/writter').default
const { replacer, replacerNoComments } = require('./functions/replacer')
const { readDir } = require('./functions/reader')

const options = yargs.usage('This command will create a new folder that will contain the path specified files\nThis folder will change some lines in JavaScript files (including comments)\n\nIt will change the lines that:\nUse: CommonJs (module.exports / require("path"))\nTo: Ecmascript (export / import)\n\nUsage: -p <path>')
  .option('p', { alias: 'path', describe: 'Route of the directory to transform (relative path) ', type: 'string', demandOption: true })
  .option('d', { alias: 'destiny', describe: 'Route where the folder created will be ', type: 'string', demandOption: false })
  .option('e', { alias: 'ecmascript', describe: 'Transform from ecmascript to commonjs ', type: 'boolean', demandOption: false })
  .option('c', { alias: 'comments', describe: "Transform also comments (If you don't add this option, the comments will also modify, but not completly)", type: 'boolean', demandOption: false })
  .argv

yargs.showHelpOnFail()

let fileSystem = [options.p]

if (fs.lstatSync(options.p).isDirectory()) {
  fileSystem = readDir(options.p)
}

if (options.c) {
  if (options.e) {
    writter(replacer(options.p, options.e), fileSystem, options.d)
  } else {
    writter(replacer(options.p), fileSystem, options.d)
  }
} else {
  if (options.e) {
    writter(replacerNoComments(options.p, options.e), fileSystem, options.d)
  } else {
    writter(replacerNoComments(options.p), fileSystem, options.d)
  }
}
