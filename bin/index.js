#!/usr/bin/env node

const yargs = require('yargs');
const { getDir } = require('./functions/reader');

const replacer = require('./functions/replacer').default
const writter = require('./functions/writter').default

const options = yargs.usage("Usage: -p <path>")
    .option("p", { alias: "path", describe: "Route of the directory to transform (relative path) ", type: "string", demandOption: true })
    .option("d", { alias: "destiny", describe: "Route where the folder created will be ", type: 'string', demandOption: false })
    .option("c", { alias: "comments", describe: "Transform also the comments ", demandOption: false })
    .option("e", { alias: "ecmascript", describe: "Transform from ecmascript to commonjs ", demandOption: false })
    .argv;

// MODULE NOT DONE
// COMMENTS NOT DONE

const fileSystem = getDir(options.path)

if (options.comments) {
    /* TODO */
} else if (options.module) {
    writter(replacer(options.path, options.module), fileSystem, options.destiny)
} else {
    writter(replacer(options.path), fileSystem, options.destiny)
}