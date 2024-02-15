const chalk = require('chalk')
const { fileReader } = require('../functions/reader')

module.exports.showRules = () => {
  console.info(chalk.cyan(fileReader('./bin/customReplaceRules/SyntaxRules.md') + '\n'))
}
