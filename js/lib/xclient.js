"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const pg = require('pg');
const collection_1 = require('./collection');
class Client {
    constructor(connection) {
        this._pgClient = null;
        this._pgClient = new pg.Client(connection);
    }
    connect() {
        return new Promise((resolve, reject) => {
            this._pgClient.connect(err => {
                if (err)
                    return reject(err);
                resolve(this);
            });
        });
    }
    query(queryText, ...args) {
        return new Promise((resolve, reject) => {
            const result = (err, res) => {
                if (err)
                    return reject(err);
                resolve(res);
            };
            if (typeof queryText === 'string') {
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
    initCollection() {
        return require('./init').init(this);
    }
    collection(name) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.createCollection(name);
            return new collection_1.Collection(name, this);
        });
    }
    collectionExists(name) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield this.query(`select pd_collection_exists($1) as result;`, name);
            return res.rows[0].result;
        });
    }
    createCollection(name) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield this.query(`select pd_create_collection($1) as result;`, name);
            return res.rows[0].result;
        });
    }
    dropCollection(name) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield this.query(`select pd_drop_collection($1) as result;`, name);
            return res.rows[0].result;
        });
    }
    truncateCollection(name) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield this.query(`select pd_truncate_collection($1) as result;`, name);
            return res.rows[0].result;
        });
    }
    listCollections() {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield this.query(`select pd_list_collections() as result;`);
            return res.rows.map(v => v.result);
        });
    }
}
exports.Client = Client;
