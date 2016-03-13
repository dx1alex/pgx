import * as _pg from 'pg';
export declare function sql(str: any, ...values: any[]): {
    text: any;
    values: any[];
};
export declare class PClient {
    private _pgClient;
    constructor(connection?: string);
    connect(): Promise<PClient>;
    query(queryText: string | _pg.QueryConfig, ...args: any[]): Promise<_pg.QueryResult>;
    end(): void;
    on(event: string, listener: Function): this;
}
export declare const pg: typeof _pg & {
    PClient: typeof PClient;
    cc: (connection?: any) => Promise<PClient>;
};
