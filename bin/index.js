#!/usr/bin/env node

const yargs = require('yargs')
const fs = require('fs-extra')

const { replacer, replacerNoComments, customReplacer } = require('./functions/replacer')
const writter = require('./functions/writter').default
const { readDir, fileReader } = require('./functions/reader')
const { showRules } = require('./rules/showRules')

const options = yargs.usage('This command will create a new folder that will contain the path specified files\nThis folder will change some lines in JavaScript files (including comments)\n\nIt will change the lines that:\nUse: CommonJs (module.exports / require("path"))\nTo: Ecmascript (export / import)\n\nUsage: -p <path>')
  .option('p', { alias: 'path', describe: 'Route of the directory to transform (relative path) ', type: 'string', demandOption: true })
  .option('d', { alias: 'destiny', describe: 'Route where the folder created will be ', type: 'string', demandOption: false })
  .option('e', { alias: 'ecmascript', describe: 'Transform from ecmascript to commonjs ', type: 'boolean', demandOption: false })
  .option('c', { alias: 'comments', describe: "Transform also comments (If you don't add this option, the comments will also modify, but not completly)", type: 'boolean', demandOption: false })
  .option('r', { alias: 'custom_replace', describe: 'Transform the files using another file to say what should change. The syntax is indicated in the -s option', type: 'string', demandOption: false })
  .option('s', { alias: 'custom_syntax', describe: 'Syntax of the file proporcionated to do a custom replace', type: 'boolean', demandOption: false })
  .argv

// DO README
// CONSOLE LOG WITH COLORS
// DO AUTOMATIC TRADUCTION WITH API FOR CONSOLE LOGS

yargs.showHelpOnFail()

if (options.s) {
  showRules()
}

let fileSystem = [options.p]

if (fs.lstatSync(options.p).isDirectory()) {
  fileSystem = readDir(options.p)
}

if (options.r !== undefined) {
  writter(customReplacer(options.p, options.r), fileSystem, options.d)
} else if (options.c) {
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
