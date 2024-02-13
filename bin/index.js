#!/usr/bin/env node

const yargs = require('yargs')
const fs = require('fs-extra')

const { replacer, replacerNoComments, customReplacer } = require('./functions/replacer')
const writter = require('./functions/writter').default
const { readDir } = require('./functions/reader')
const { showRules } = require('./customReplaceRules/showRules')

const options = yargs.usage('This command will create a new folder that will contain a transformation of the files from the specified path\nThis folder will change some lines in the JavaScript files (including comments)\n\nIt will change the lines that:\nUse: CommonJs (module.exports / require("path"))\nTo: Ecmascript (export / import)\n\nIt does not work on parent folders from where it is executed\n\nUsage: -p <path>')
  .option('p', { alias: 'path', describe: 'Route of the directory to transform (relative path)', type: 'string', demandOption: true })
  .option('d', { alias: 'destiny', describe: 'Route where the folder created will be', type: 'string', demandOption: false })
  .option('e', { alias: 'ecmascript', describe: 'Transform from ecmascript to commonjs', type: 'boolean', demandOption: false })
  .option('c', { alias: 'comments', describe: "Transform also comments (If you don't add this option, the comments will also modify, but not completly. It does not work on custom replace)", type: 'boolean', demandOption: false })
  .option('r', { alias: 'custom_replace', describe: 'Transform the files using a rule file mentioned in with this option. The syntax is indicated in the -s option', type: 'string', demandOption: false })
  .option('s', { alias: 'custom_syntax', describe: 'Syntax of the rule file proporcionated to do a custom replace', type: 'boolean', demandOption: false })
  .argv

// USE CONSOLE COLORS INSTEAD OF \x1b[2m

yargs.showHelpOnFail()

if (options.s) {
  showRules()
}

let fileSystem = [options.p]

if (fs.lstatSync(options.p).isDirectory()) {
  fileSystem = readDir(options.p)
}

if (options.r) {
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

if (options.d) {
  console.log('\x1b[1m', 'The transformed files will be on the folder: ' + options.d, '\x1b[0m')
} else {
  console.log('\x1b[1m', 'The transformed files will be on the folder: ./result', '\x1b[0m')
}
