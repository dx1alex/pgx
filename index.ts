import * as _pg from 'pg'

function cc(connection?) {
  return new PClient(connection).connect()
}

export function sql(str, ...values) {
  return {
    text: str.reduce((prev, curr, i) => prev + "$" + i + curr),
    values
  }
}

export class PClient {
  private _pgClient: _pg.Client = null
  constructor(connection?: string) {
    this._pgClient = new _pg.Client(connection)
  }
  connect(): Promise<PClient> {
    return new Promise(resolve => {
      this._pgClient.connect(err => {
        if (err) throw err
        resolve(this)
      })
    })
  }
  query(queryText: string | _pg.QueryConfig, ...args): Promise<_pg.QueryResult> {
    return new Promise(resolve => {
      const result = (err, res) => {
        if (err) throw err
        resolve(res)
      }
      if (typeof queryText === 'string') {
        console.log(queryText)
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
}

export const pg = Object.assign(_pg, { PClient, cc })
