import * as pg from 'pg';
import { Client } from './lib/client';
export * from './lib/client';
export * from './lib/collection';
declare function sql(str: any, ...values: any[]): {
    text: any;
    values: any[];
};
declare const pgx: {
    cc: (connection?: any) => Client;
    connect: (connection?: any) => Client;
};
export { pg, pgx, sql };
export default pgx;
