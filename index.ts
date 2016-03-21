import * as _pg from 'pg'
import { Client } from './lib/client'

export * from './lib/client'
export * from './lib/collection'

function cc(connection?) {
  return new Client(connection).connect()
}

export function sql(str, ...values) {
  return {
    text: str.reduce((prev, curr, i) => prev + "$" + i + curr),
    values
  }
}

export const pg = Object.assign(_pg, { cc })

export default pg
