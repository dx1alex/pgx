"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
const _pg = require('pg');
const client_1 = require('./lib/client');
__export(require('./lib/client'));
__export(require('./lib/collection'));
function cc(connection) {
    return new client_1.Client(connection).connect();
}
function sql(str, ...values) {
    return {
        text: str.reduce((prev, curr, i) => prev + "$" + i + curr),
        values: values
    };
}
exports.sql = sql;
exports.pg = Object.assign(_pg, { cc: cc });
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = exports.pg;
