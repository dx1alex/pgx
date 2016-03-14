import * as _pg from 'pg'
import {XClient} from './lib/xclient'

function cc(connection?) {
  return new XClient(connection).connect()
}

export function sql(str, ...values) {
  return {
    text: str.reduce((prev, curr, i) => prev + "$" + i + curr),
    values
  }
}

export const pg = Object.assign(_pg, { XClient, cc })
