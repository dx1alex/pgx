"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
const pg = require('pg');
exports.pg = pg;
const client_1 = require('./lib/client');
__export(require('./lib/client'));
__export(require('./lib/collection'));
function cc(connection) {
    return new client_1.Client(connection).connect();
}
const connect = cc;
function sql(str, ...values) {
    return {
        text: str.reduce((prev, curr, i) => prev + "$" + i + curr),
        values
    };
}
exports.sql = sql;
const pgx = { cc, connect };
exports.pgx = pgx;
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = pgx;
