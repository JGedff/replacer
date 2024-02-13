const { fileReader } = require('../functions/reader')

module.exports.showRules = () => {
  console.info('\x1b[36m', fileReader('./bin/customReplaceRules/SyntaxRules.md') + '\n', '\x1b[0m')
}
