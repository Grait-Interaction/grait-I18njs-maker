#!/usr/bin/env node
const fs = require('fs')
const request = require('request')

module.exports = function (url, dest, cb) {
    const sendReq = request.get(url)
    const file = fs.createWriteStream(dest)

    // verify response code
    sendReq.on('response', function (response) {
        if (response.statusCode !== 200) {
            return cb('Server responded with status ' + response.statusCode)
        }

        sendReq.pipe(file)

        file.on('finish', function () {
            file.close(cb)  // close() is async, call cb after close completes.
        })

        file.on('error', function (err) { // Handle errors
            fs.unlink(dest) // Delete the file async. (But we don't check the result)
            return cb(err.message)
        })

    })

    // check for request errors
    sendReq.on('error', function (err) {
        fs.unlink(dest)
        return cb(err.message)
    })
}