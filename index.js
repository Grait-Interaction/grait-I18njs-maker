#!/usr/bin / env node
const chalk = require('chalk')
const download = require('./src/download')
const utils = require('./src/utils')

const [,, ...args] = process.argv

console.log(chalk.yellow(args))

console.log(utils.getConfig())

// console.log(chalk.blue.bgRed.bold('Hello world!'))

return

// Retrieve document key
const key = JSON.parse(packagejson).copyDoc

// Prepare google play url
const url = `https://docs.google.com/feeds/download/spreadsheets/Export?key=${key}&exportFormat=csv`

download(url, 'tmp_copyDoc.csv', () => {

    const TRANSLATIONS = {}
    const translationsMap = {}

    fs.readFileSync("tmp_copyDoc.csv").toString().split("\n").forEach(function (line, index, arr) {
        if (index === arr.length - 1 && line === "") { return }

        const split = line.split(',')

        if (index === 1) {
            for (let i = 3; i < split.length - 2; i++) {
                TRANSLATIONS[split[i]] = {}
                translationsMap[i] = split[i]
            }
        }

        if (index !== 0 && index !== 1 && split[1]) {

            for (const key in translationsMap) {
                TRANSLATIONS[translationsMap[key]][split[1]] = split[key]
            }
        }
    })

    // WRITE TO FILES
    let langCount = 0
    for (const lang in translationsMap) {
        langCount++
        const fileName = `./resources/locales/${translationsMap[lang]}.js`

        const stream = fs.createWriteStream(fileName)
        stream.once('open', function (fd) {
            stream.write("export default {\n")

            for (const transKey in TRANSLATIONS[translationsMap[lang]]) {

                const value = TRANSLATIONS[translationsMap[lang]][transKey].replace(/[\\$'"]/g, "\\$&")

                stream.write(`    ${transKey}: '${value}',\n`)
            }

            stream.write("}")
            stream.end()
        })
    }

    console.log(`DONE : Generated ${langCount} language files`)
    for (const lang in translationsMap) {
        console.log(`  - ${translationsMap[lang]}    (./resources/locales/${translationsMap[lang]}.js)`)
    }
})