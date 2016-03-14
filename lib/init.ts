import * as fs from 'fs'
import * as path from 'path'

const fsql = path.resolve(__dirname, '../../sql/init.sql')

export function init(db) {
  return new Promise((resolve, reject) => {
    fs.readFile(fsql, 'utf8', (err, sql) => {
      if (err) return reject(err)
      db.query(sql)
        .then(resolve)
        .catch(reject)
    })
  })
}
