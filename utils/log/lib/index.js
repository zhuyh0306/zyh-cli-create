'use strict';
const log = require('npmlog');
log.level = process.env.LOG_LEVEL?process.env.LOG_LEVEL:'info';
log.heading ='zyh';
log.headingStyle = { fg: 'red', bg: 'black'};
log.addLevel('success', 2000, { fg: 'blue', blod: true });

















module.exports = log;

