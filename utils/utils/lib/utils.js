'use strict';

module.exports = {
    utils,
    isObject
};
function isObject(o) {
    return Object.prototype.toString.call(o) === '[object Object]';
  }
function utils() {
    // TODO
    console.log('我是utils')
}
