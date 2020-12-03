const axios = require("axios")

function query(url, headers, data) {
    return new Promise((reslove, reject) => {
        axios({
            method: 'post',
            headers,
            url,
            data
        }).then(res => {
            reslove(res)
        }).catch(err => {
            reject(err)
        })
    })
}

module.exports = query