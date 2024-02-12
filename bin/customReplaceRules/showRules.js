const { fileReader } = require('../functions/reader')

module.exports.showRules = () => {
  console.info(fileReader('./bin/customReplaceRules/SyntaxRules.md') + '\n')
}
