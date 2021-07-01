'use strict';

const path = require('path');
const log = require('@zyh-cli-create/log');
const createCommand = require('@zyh-cli-create/create');
const semver = require('semver');
const colors = require('colors');
const pkg = require('../package.json');
const constant = require('./const');
const userHome = require('user-home');
const pathExists = require('path-exists');
const commander = require('commander');

const program = new commander.Command();

function core() {
    // TODO
    try{
        preCheck();
        registerCommand();
    }catch (e){
        log.error(e.message);
    }
}

async function preCheck(){
    checkPkgVersion();
    checkNodeVersion();
    checkUserHome();
    checkRoot();
    // checkInputArgv();
    checkEnv();
    await isNeedUpdate();
}
//
async function isNeedUpdate(){
    //1获取当前包的版本号和包名
    const npmVersion =  pkg.version;
    const npmName = pkg.name;
    const { getNpmSemverVersion } = require('@zyh-cli-create/get-npm-info');
    //2调用npm API获取所有版本号
    const lastVersion = await getNpmSemverVersion(npmVersion, npmName);
    if (lastVersion && semver.satisfies(lastVersion, npmVersion)) {
      log.warn(colors.yellow(`请手动更新 ${npmName}，当前版本：${currentVersion}，最新版本：${lastVersion}
                  更新命令： npm install -g ${npmName}`));
    }
    //4提示更新到最新版本
}
function checkEnv() {
    const dotenv = require('dotenv');
    const dotenvPath = path.resolve(userHome, '.env');
    if (pathExists(dotenvPath)) {
        dotenv.config({
        path: dotenvPath,
        });
    }
    createDefaultConfig();
}

function createDefaultConfig() {
    const cliConfig = {
        home: userHome,
    };
    if (process.env.CLI_HOME) {
        cliConfig['cliHome'] = path.join(userHome, process.env.CLI_HOME);
    } else {
        cliConfig['cliHome'] = path.join(userHome, constant.DEFAULT_CLI_HOME);
    }
    process.env.CLI_HOME_PATH = cliConfig.cliHome;
}
  

//检查参数
function checkInputArgv(){
    const argv = require('minimist')(process.argv.slice(2)) 
    if(argv.debug) {
        process.env.LOG_LEVEL = 'verbose';
    } else {
        process.env.LOG_LEVEL = 'info';
    }
    log.level = process.env.LOG_LEVEL;
}
//校验包版本
function checkPkgVersion() {
//    log.notice('cli',pkg.version);
}
//校验npm版本
function checkNodeVersion(){
    const wantNodeVersion=pkg.engines.node;
    const currentNodeVersion = process.version;
    if(!semver.satisfies(currentNodeVersion,wantNodeVersion)){
        throw new Error(colors.red(`zyh-cli-create需要安装${wantNodeVersion}`))
    }
}
//校验root账号
function checkRoot(){
   if(process.platform!=='win32'){
    const rootCheck = require('root-check');
    rootCheck();
   }
   
}
//检查用户主目录
function checkUserHome(){
    if(!userHome || !pathExists(userHome)){
        throw new Error(colors.red('当前登录用户主目录不存在！')); 
    }
}
//注册命令
function registerCommand(){
    program.name(Object.keys(pkg.bin)[0])
    .version(pkg.version)
    .usage('<command> [options]')
    .option('-d, --debug','是否开启debug调试模式',false)

    program
    .command('create [projectName]')
    .option('-f, --force', '是否强制初始化项目')
    .action(createCommand);
    
  // 开启debug模式
    program.on('option:debug', function() {
        process.env.LOG_LEVEL = 'verbose';
        log.level = process.env.LOG_LEVEL;
    });
    //未知命令监听
    program.on('command:*', function(obj) {
        const availableCom = program.commands.map(v=> v.name()).splice(',')
        console.log(colors.red('未知的命令：' + obj[0]));
        if (availableCom.length > 0) {
          console.log(colors.red('可用命令：' + availableCom.join(',')));
        }
    });
    //未输入命令，打印帮助文档
    if(process.argv.length<3){
        program.outputHelp();
    }
    program.parse(process.argv);
}
module.exports = core;