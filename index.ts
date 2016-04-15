import * as pg from 'pg'
import { Client } from './lib/client'

export * from './lib/client'
export * from './lib/collection'

function cc(connection?) {
  return new Client(connection).connect()
}
const connect = cc

function sql(str, ...values) {
  return {
    text: str.reduce((prev, curr, i) => prev + "$" + i + curr),
    values
  }
}

const pgx = { cc, connect }

export {pg, pgx, sql}
export default pgx 
