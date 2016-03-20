"use strict";
const _pg = require('pg');
const xclient_1 = require('./lib/xclient');
function cc(connection) {
    return new xclient_1.XClient(connection).connect();
}
function sql(str, ...values) {
    return {
        text: str.reduce((prev, curr, i) => prev + "$" + i + curr),
        values: values
    };
}
exports.sql = sql;
exports.pg = Object.assign(_pg, { XClient: xclient_1.XClient, cc: cc });
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = exports.pg;
