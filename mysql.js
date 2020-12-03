const mysql = require('mysql')

const options = {
  host: '',
  port: '',
  user: '',
  password: '',
  database: '',
  useConnectionPooling: true
}

const pool = mysql.createPool(options)

function Myquery(sql, param) {
  return new Promise((reslove, reject) => {
    pool.getConnection((err, conn) => {
      conn.query(sql, param, (err, results) => {
        if (err) {
          reject(err)
          return
        }
        reslove(results)
        pool.end()
      })
    })
  })
}


module.exports = Myquery