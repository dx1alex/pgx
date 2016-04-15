"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
class Collection {
    constructor(name, client) {
        this.client = client;
        [this.name, this.schema = 'collections'] = name.split('.').reverse();
        this.tableName = this.schema + '.' + this.name;
    }
    truncate() {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield this.client.query(`select pd_truncate_collection('${this.name}', '${this.schema}') as result;`);
            return res.rows[0].result;
        });
    }
    drop() {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield this.client.query(`select pd_drop_collection('${this.name}', '${this.schema}') as result;`);
            return res.rows[0].result;
        });
    }
    delete(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const q = this._sqlQuery(query);
            const sql = `delete from ${this.tableName} where ${q.where || true};`;
            const res = yield this.client.query(sql, ...q.args);
            return res.rowCount;
        });
    }
    insert(doc) {
        return __awaiter(this, void 0, void 0, function* () {
            if (Object(doc)[Symbol.iterator] !== undefined) {
                const sql = `insert into ${this.tableName} (body) values ${doc.map(v => `($json$${JSON.stringify(v)}$json$)`).join(',')} returning id;`;
                const res = yield this.client.query(sql);
                let i = 0;
                for (let d of doc)
                    d.id = res.rows[i++];
                return doc;
            }
            const res = yield this.client.query(`insert into ${this.tableName} (body) values ($1) returning id;`, doc);
            doc.id = res.rows[0].id;
            return doc;
        });
    }
    update(doc, query) {
        return __awaiter(this, void 0, void 0, function* () {
            const q = this._sqlQuery(query);
            const sql = `update ${this.tableName} set body = jsonb_set(body, $1, $2) where ${q.where || true};`;
            const key = Object.keys(doc)[0];
            const res = yield this.client.query(sql, key.split('.'), doc[key], ...q.args);
            return res.rowCount;
        });
    }
    save(doc, createNew) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield this.client.query(`update ${this.tableName} set body = $1 where id = $2;`, doc, doc.id);
            return res.rowCount;
        });
    }
    find(query, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const q = this._sqlQuery(query, options);
            const sql = `select${Object(options).distinct ? ' distinct' : ''} ${q.select || 'body'}
      from ${this.tableName}
      where ${q.where || true}
      ${q.orderBy ? 'order by ' + q.orderBy : ''} ${q.limit ? 'limit ' + q.limit : ''};`;
            const res = yield this.client.query(sql, ...q.args);
            return res.rows.map(v => q.select ? v : v.body);
        });
    }
    find1(query, options = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            options.limit = 1;
            const res = yield this.find(query, options);
            return res[0] || null;
        });
    }
    count(query, options = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            options.select = 'count(*) as cnt';
            const res = yield this.find(query, options);
            return res[0].cnt;
        });
    }
    _sqlQuery(query, options) {
        let result = { args: [] };
        let opt = options;
        let n = 1;
        if (typeof opt === 'number') {
            result.limit = opt;
        }
        else if (Object(opt).select) {
            let select = [];
            if (typeof opt.select === 'object') {
                for (let k of Object.keys(opt.select)) {
                    select.push(`body #> $${n++} as "${k}"`);
                    result.args.push(opt.select[k].split('.'));
                }
            }
            else {
                select = [opt.select];
            }
            result.select = select.join(', ');
        }
        if (typeof query === 'number') {
            result.where = `id = ${query}`;
        }
        else if (Array.isArray(query)) {
            result.where = `id in (${query.filter(id => typeof id === 'number').join(', ')})`;
        }
        else if (typeof query === 'string') {
            result.where = `body @@ $${n++}`;
            result.args.push(query);
        }
        else if (query !== null && typeof query === 'object') {
            result.where = `body @> $${n++}`;
            result.args.push(query);
        }
        if (Object(opt).sort) {
            const key = Object.keys(opt.sort)[0];
            const by = key.split('.');
            result.orderBy = `body #> $${n++}`;
            result.args.push(by);
            if (opt.sort[key] < 0) {
                result.orderBy += ' desc';
            }
            else if (opt.sort[key] > 0) {
                result.orderBy += ' asc';
            }
        }
        return result;
    }
}
exports.Collection = Collection;
