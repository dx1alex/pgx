import * as _pg from 'pg';
import { Client } from './lib/client';
export * from './lib/client';
export * from './lib/collection';
export declare function sql(str: any, ...values: any[]): {
    text: any;
    values: any[];
};
export declare const pg: typeof _pg & {
    cc: (connection?: any) => Promise<Client>;
};
export default pg;
