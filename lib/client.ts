import * as pg from 'pg'
import {Collection} from './collection'

const TIMESTAMPTZ_OID = 1184
const TIMESTAMP_OID = 1114
function parseFn(val) {
  return val === null ? null : new Date(val) // moment(val)
}
pg.types.setTypeParser(TIMESTAMPTZ_OID, parseFn)
pg.types.setTypeParser(TIMESTAMP_OID, parseFn)

export class Client {
  private _pgClient: pg.Client = null
  constructor(connection?: string) {
    this._pgClient = new pg.Client(connection)
  }
  connect() {
    this._pgClient.connect(err => { if (err) throw err })
    return this
  }
  query(queryText: string | pg.QueryConfig, ...args): Promise<pg.QueryResult> {
    return new Promise((resolve, reject) => {
      const result = (err, res) => {
        if (err) return reject(err)
        resolve(res)
      }
      if (typeof queryText === 'string') {
        this._pgClient.query(queryText, [...args], result)
      }
      else {
        this._pgClient.query(queryText, result)
      }
    })
  }
  end() {
    this._pgClient.end()
  }
  on(event: string, listener: Function): this {
    this._pgClient.on(event, listener)
    return this
  }
  initCollection() {
    return require('./init').init(this)
  }
  async collection(name: string) {
    await this.createCollection(name)
    return new Collection(name, this)
  }
  async collectionExists(name: string) {
    const res = await this.query(`select pd_collection_exists($1) as result;`, name)
    return res.rows[0].result
  }
  async createCollection(name: string) {
    const res = await this.query(`select pd_create_collection($1) as result;`, name)
    return res.rows[0].result
  }
  async dropCollection(name: string) {
    const res = await this.query(`select pd_drop_collection($1) as result;`, name)
    return res.rows[0].result
  }
  async truncateCollection(name: string) {
    const res = await this.query(`select pd_truncate_collection($1) as result;`, name)
    return res.rows[0].result
  }
  async listCollections() {
    const res = await this.query(`select pd_list_collections() as result;`)
    return res.rows.map(v => v.result)
  }
}
