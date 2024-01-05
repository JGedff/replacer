let a = 0
let b = 1
let c = 2
let d = 3
let e = 4
let f = 5

/* --------------------------------- */

module.exports = 5
// -
module.exports = {
    "test": 44,
    "name": 65
}
// -
module.exports = {
    a,
    b
}
// -
exports = {
    c,
    "name": 65
}
// -
module.exports.newFunction = () => {
    console.log('test')
}
// -
module.exports = require('path')
// -
module.exports = require('path').name
// -
module.exports.newName = require('path')
// -
module.exports.newName = require('path').name

/* ------------------------------------------ */

exports = 5
// -
exports = {
    "test": 44,
    "name": 65
}
// -
exports = {
    d,
    e
}
// -
exports = {
    f,
    "name": 65
}
// -
exports.newFunction = () => {
    console.log('test')
}

/* ------------------------------------------ */

let g = require('test')
// -
const maker = require('test').make
// -
const { make } = require('test')
// -
let { generator } = require('test').make