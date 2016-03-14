import { XClient } from './xclient';
export declare class Collection {
    db: XClient;
    readonly name: string;
    readonly schema: string;
    readonly tableName: string;
    constructor(name: string, db: XClient);
    truncate(): Promise<any>;
    drop(): Promise<any>;
    delete(query?: any): Promise<any>;
    insert(doc: any): Promise<any>;
    update(doc: any, query?: any): Promise<any>;
    save(doc: any, createNew?: boolean): Promise<any>;
    find(query?: any, options?: number | QueryOptions): Promise<any[]>;
    find1(query?: any, options?: QueryOptions): Promise<any>;
    count(query?: any, options?: QueryOptions): Promise<any>;
    private _sqlQuery(query?, options?);
}
export interface QueryOptions {
    distinct?: any;
    select?: any;
    limit?: any;
    sort?: any;
}
