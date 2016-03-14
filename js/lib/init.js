"use strict";
const fs = require('fs');
const path = require('path');
const fsql = path.resolve(__dirname, '../../sql/init.sql');
function init(db) {
    return new Promise((resolve, reject) => {
        fs.readFile(fsql, 'utf8', (err, sql) => {
            if (err)
                return reject(err);
            db.query(sql)
                .then(resolve)
                .catch(reject);
        });
    });
}
exports.init = init;
