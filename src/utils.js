const fs = require('fs')
const chalk = require('chalk')

const DIR = process.cwd()

const getCSVUri = function (key){
    return `https://docs.google.com/feeds/download/spreadsheets/Export?key=${key}&exportFormat=csv`
}

const getConfig = function (){

    const path = `${DIR}/\.grait-i18n`

    // Make sure conf file exists
    if (fs.existsSync(path)){
        const content = JSON.parse(fs.readFileSync(path))
        return content
    }

    console.error(chalk.red.bold('!!! No config file could be found in this directory !!!\n'))
    return false
}

function mkdir_p(path, mode, callback, position) {
    mode = mode || 0777;
    position = position || 0;
    parts = require('path').normalize(path).split('/');

    if (position >= parts.length) {
        if (callback) {
            return callback();
        } else {
            return true;
        }
    }

    var directory = parts.slice(0, position + 1).join('/');
    fs.stat(directory, function (err) {
        if (err === null) {
            mkdir_p(path, mode, callback, position + 1);
        } else {
            fs.mkdir(directory, mode, function (err) {
                if (err) {
                    if (callback) {
                        return callback(err);
                    } else {
                        throw err;
                    }
                } else {
                    mkdir_p(path, mode, callback, position + 1);
                }
            })
        }
    })
}

module.exports = {
    mkdir_p: mkdir_p,
    getCSVUri: getCSVUri,
    getConfig: getConfig
}