#!/usr/bin/env node
const chalk = require('chalk')
const download = require('../src/download')
const utils = require('../src/utils')
const fs = require('fs')
const DIR = process.cwd()
const [,, ...args] = process.argv

// console.log(chalk.yellow(args))
// console.log(chalk.blue.bgRed.bold('Hello world!'))

// Prepare google sheet url
const googleSheetKey = utils.getConfig().key
const url = `https://docs.google.com/feeds/download/spreadsheets/Export?key=${googleSheetKey}&exportFormat=csv`

function writeFiles(TRANSLATIONS, translationsMap){

    let langCount = 0

    for (const lang in translationsMap) {
        langCount++
        const fileName = `${utils.getConfig().directory}/${translationsMap[lang]}.js`

        const stream = fs.createWriteStream(fileName, { flags: 'w+' })
        stream.once('open', function (fd) {
            stream.write("export default {\n")

            for (const transKey in TRANSLATIONS[translationsMap[lang]]) {

                if (TRANSLATIONS[translationsMap[lang]][transKey] !== null && typeof TRANSLATIONS[translationsMap[lang]][transKey] === 'object' ){
                    
                    const pluralList = [' {\n']
                    for (const typeKey of Object.keys(TRANSLATIONS[translationsMap[lang]][transKey])) {
                        if (TRANSLATIONS[translationsMap[lang]][transKey][typeKey].length > 0){
                            pluralList.push(
                                `        ${typeKey}: '${TRANSLATIONS[translationsMap[lang]][transKey][typeKey].replace(/[\\$'"]/g, "\\$&")}',\n`
                            )
                        }
                    }

                    pluralList.push('    }')
                    stream.write(`    ${transKey}: ${pluralList.join('')},\n`)

                }else{
                    if (TRANSLATIONS[translationsMap[lang]][transKey].length > 0){
                        const value = TRANSLATIONS[translationsMap[lang]][transKey].replace(/[\\$'"]/g, "\\$&")
                        stream.write(`    ${transKey}: '${value}',\n`)
                    }
                }
            }

            stream.write("}")
            stream.end()
        })
    }

    // Remove temp file
    fs.unlink("tmp_copyDoc.csv", ()=>{})

    console.log(`${chalk.green.bold('DONE')}: Generated ${chalk.bold(langCount)} language files`)
    for (const lang in translationsMap) {
        console.log(`  - ${chalk.blue(translationsMap[lang])}    ${chalk.underline.rgb(160, 160, 160)(`${utils.getConfig().directory}/${translationsMap[lang]}.js`)}`)
    }
}

if (!utils.getConfig()){ return }

download(url, 'tmp_copyDoc.csv', (error) => {

    if(error){
        console.log(chalk.bgRed.yellow(error))
        return false
    }

    const TRANSLATIONS = {}
    const translationsMap = {}

    fs.readFileSync("tmp_copyDoc.csv").toString().split("\n").forEach(function (line, index, arr) {
        if (index === arr.length - 1 && line === "") { return }

        const split = line.split(',')
        const type = split[2]

        if (index === 1) {
            for (let i = 3; i < split.length - 2; i++) {
                TRANSLATIONS[split[i]] = {}
                translationsMap[i] = split[i]
            }
        }

        if (index !== 0 && index !== 1 && split[1]) {

            for (const key in translationsMap) {

                if(type){
                    if ( TRANSLATIONS[translationsMap[key]][split[1]] ){
                        TRANSLATIONS[translationsMap[key]][split[1]][type] = split[key]
                    }else{
                        TRANSLATIONS[translationsMap[key]][split[1]] = {
                            [type]: split[key]
                        }
                    }
                }else{
                    TRANSLATIONS[translationsMap[key]][split[1]] = split[key]
                }
            }
        }
    })

    try {
        utils.mkdir_p(`${utils.getConfig().directory}`, null, ()=>{
            writeFiles(TRANSLATIONS, translationsMap)
        })
    } catch (error) { 
        console.log(chalk.yellow.bgRed.bold('ERROR: sry something went wrong...'))
        console.log(error.message)
    }
})