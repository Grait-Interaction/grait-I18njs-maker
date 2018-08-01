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
    return
}

module.exports = {
    getCSVUri: getCSVUri,
    getConfig: getConfig
}