"use strict";
const _pg = require('pg');
function cc(connection) {
    return new PClient(connection).connect();
}
function sql(str, ...values) {
    return {
        text: str.reduce((prev, curr, i) => prev + "$" + i + curr),
        values: values
    };
}
exports.sql = sql;
class PClient {
    constructor(connection) {
        this._pgClient = null;
        this._pgClient = new _pg.Client(connection);
    }
    connect() {
        return new Promise(resolve => {
            this._pgClient.connect(err => {
                if (err)
                    throw err;
                resolve(this);
            });
        });
    }
    query(queryText, ...args) {
        return new Promise(resolve => {
            const result = (err, res) => {
                if (err)
                    throw err;
                resolve(res);
            };
            if (typeof queryText === 'string') {
                console.log(queryText);
                this._pgClient.query(queryText, [...args], result);
            }
            else {
                this._pgClient.query(queryText, result);
            }
        });
    }
    end() {
        this._pgClient.end();
    }
    on(event, listener) {
        this._pgClient.on(event, listener);
        return this;
    }
}
exports.PClient = PClient;
exports.pg = Object.assign(_pg, { PClient: PClient, cc: cc });
