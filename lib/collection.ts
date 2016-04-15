import {Client} from './client'

export class Collection {
  readonly name: string
  readonly schema: string
  readonly tableName: string
  constructor(name: string, public client: Client) {
    [this.name, this.schema = 'collections'] = name.split('.').reverse()
    this.tableName = this.schema + '.' + this.name
  }
  async truncate() {
    const res = await this.client.query(`select pd_truncate_collection('${this.name}', '${this.schema}') as result;`)
    return res.rows[0].result
  }
  async drop() {
    const res = await this.client.query(`select pd_drop_collection('${this.name}', '${this.schema}') as result;`)
    return res.rows[0].result
  }
  async delete(query?: any) {
    const q = this._sqlQuery(query)
    const sql = `delete from ${this.tableName} where ${q.where || true};`
    const res: any = await this.client.query(sql, ...q.args)
    return res.rowCount
  }
  async insert(doc: any) {
    if (Object(doc)[Symbol.iterator] !== undefined) {
      const sql = `insert into ${this.tableName} (body) values ${
        doc.map(v => `($json$${JSON.stringify(v)}$json$)`).join(',')
        } returning id;`
      const res = await this.client.query(sql)
      let i = 0
      for (let d of doc) d.id = res.rows[i++]
      return doc
    }
    const res = await this.client.query(`insert into ${this.tableName} (body) values ($1) returning id;`, doc)
    doc.id = res.rows[0].id
    return doc
  }
  async update(doc: any, query?: any) {
    const q = this._sqlQuery(query)
    const sql = `update ${this.tableName} set body = jsonb_set(body, $1, $2) where ${q.where || true};`
    const key = Object.keys(doc)[0]
    const res: any = await this.client.query(sql, key.split('.'), doc[key], ...q.args)
    return res.rowCount
  }
  async save(doc: any, createNew?: boolean) {
    const res: any = await this.client.query(`update ${this.tableName} set body = $1 where id = $2;`, doc, doc.id)
    return res.rowCount
  }
  async find(query?: any, options?: number | QueryOptions) {
    const q = this._sqlQuery(query, options)
    const sql = `select${Object(options).distinct ? ' distinct' : ''} ${q.select || 'body'}
      from ${this.tableName}
      where ${q.where || true}
      ${q.orderBy ? 'order by ' + q.orderBy : ''} ${q.limit ? 'limit ' + q.limit : ''};`
    //console.log(sql)
    const res = await this.client.query(sql, ...q.args)
    return res.rows.map(v => q.select ? v : v.body)
  }
  async find1(query?: any, options: QueryOptions = {}) {
    options.limit = 1
    const res = await this.find(query, options)
    return res[0] || null
  }
  async count(query?: any, options: QueryOptions = {}) {
    options.select = 'count(*) as cnt'
    const res = await this.find(query, options)
    return res[0].cnt
  }

  private _sqlQuery(query?: any, options?: number | QueryOptions) {
    let result: any = { args: [] }
    let opt: any = options
    let n = 1
    if (typeof opt === 'number') {
      result.limit = opt
    }
    else if (Object(opt).select) {
      let select = []
      if (typeof opt.select === 'object') {
        for (let k of Object.keys(opt.select)) { // TODO! k is string
          select.push(`body #> $${n++} as "${k}"`)
          result.args.push(opt.select[k].split('.'))
        }
      }
      else {
        // TODO! options.select is string
        select = [opt.select]
      }
      result.select = select.join(', ')
    }
    if (typeof query === 'number') {
      result.where = `id = ${query}`
    }
    else if (Array.isArray(query)) {
      result.where = `id in (${query.filter(id => typeof id === 'number').join(', ')})`
    }
    else if (typeof query === 'string') {
      result.where = `body @@ $${n++}`
      result.args.push(query)
    }
    else if (query !== null && typeof query === 'object') {
      result.where = `body @> $${n++}`
      result.args.push(query)
    }
    if (Object(opt).sort) {
      const key = Object.keys(opt.sort)[0]
      const by = key.split('.')
      result.orderBy = `body #> $${n++}`
      result.args.push(by)
      if (opt.sort[key] < 0) {
        result.orderBy += ' desc'
      }
      else if (opt.sort[key] > 0) {
        result.orderBy += ' asc'
      }
    }
    return result
  }
}

export interface QueryOptions {
  distinct?
  select?
  limit?
  sort?
}
