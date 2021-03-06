import * as pg from 'pg';
import { Collection } from './collection';
export declare class Client {
    private _pgClient;
    constructor(connection?: string);
    connect(): this;
    query(queryText: string | pg.QueryConfig, ...args: any[]): Promise<pg.QueryResult>;
    end(): void;
    on(event: string, listener: Function): this;
    initCollection(): any;
    collection(name: string): Promise<Collection>;
    collectionExists(name: string): Promise<any>;
    createCollection(name: string): Promise<any>;
    dropCollection(name: string): Promise<any>;
    truncateCollection(name: string): Promise<any>;
    listCollections(): Promise<any[]>;
}
