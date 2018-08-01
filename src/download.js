const fs = require('fs')
const request = require('request')

module.exports = function (url, dest, cb) {
    const file = fs.createWriteStream(dest)
    const sendReq = request.get(url)

    // verify response code
    sendReq.on('response', function (response) {
        if (response.statusCode !== 200) {
            return cb('Response status was ' + response.statusCode)
        }
    })

    // check for request errors
    sendReq.on('error', function (err) {
        fs.unlink(dest)
        return cb(err.message)
    })

    sendReq.pipe(file)

    file.on('finish', function () {
        file.close(cb)  // close() is async, call cb after close completes.
    })

    file.on('error', function (err) { // Handle errors
        fs.unlink(dest) // Delete the file async. (But we don't check the result)
        return cb(err.message)
    })
}