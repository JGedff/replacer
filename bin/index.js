#!/usr/bin/env node

const yargs = require('yargs')

const writter = require('./functions/writter').default
const { replacer } = require('./functions/replacer')
const { readDir } = require('./functions/reader')

const options = yargs.usage('Usage: -p <path>')
  .option('p', { alias: 'path', describe: 'Route of the directory to transform (relative path) ', type: 'string', demandOption: true })
  .option('d', { alias: 'destiny', describe: 'Route where the folder created will be ', type: 'string', demandOption: false })
  .option('e', { alias: 'ecmascript', describe: 'Transform from ecmascript to commonjs ', demandOption: false })
  .argv

// ECMASCRIPT NOT DONE

const fileSystem = readDir(options.path)

if (options.ecmascript) {
  writter(replacer(options.path, options.ecmascript), fileSystem, options.destiny)
} else {
  writter(replacer(options.path), fileSystem, options.destiny)
}
