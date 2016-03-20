import * as _pg from 'pg';
import { XClient } from './lib/xclient';
export * from './lib/xclient';
export * from './lib/collection';
export declare function sql(str: any, ...values: any[]): {
    text: any;
    values: any[];
};
export declare const pg: typeof _pg & {
    cc: (connection?: any) => Promise<XClient>;
};
export default pg;
