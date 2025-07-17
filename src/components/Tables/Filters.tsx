import React from "react";
import { Database } from "@/databaseTypesFile";
import { PostgrestFilterBuilder } from "@supabase/postgrest-js";
import { UrlQueryParamsRecord } from "@/common/urlQueryParams";

export enum PaginationType {
    Server = "SERVER",
    Client = "CLIENT",
}

export type DbQuery<DbData extends Record<string, unknown>> = PostgrestFilterBuilder<
    Database["public"],
    DbData,
    unknown
>;

export type ServerSideFilterMethod<DbData extends Record<string, unknown>, State> = (
    query: DbQuery<DbData>,
    state: State
) => DbQuery<DbData>;

export type ClientSideFilterMethod<Data, State> = (
    row: Data,
    state: State,
    rowKey?: keyof Data
) => boolean;

interface BasicFilter<Data, State> {
    key: string;
    rowKey?: keyof Data;
    filterComponent: (
        state: State,
        setState: (state: State) => void,
        isDisabled: boolean
    ) => React.ReactNode;
    initialState: State;
    state: State;
    areStatesIdentical: (stateA: State, stateB: State) => boolean;
    generateUrlParam: () => UrlQueryParamsRecord;
    readStateFromUrlQueryParams: (urlParams: UrlQueryParamsRecord) => State | null;
    shouldPersistOnClear: boolean;
    isDisabled: boolean;
    isHidden: boolean;
    isHiddenInUrl: boolean;
}

export interface ServerSideFilter<Data, State, DbData extends Record<string, unknown>>
    extends BasicFilter<Data, State> {
    method: ServerSideFilterMethod<DbData, State>;
}

export interface ClientSideFilter<Data, State> extends BasicFilter<Data, State> {
    method: ClientSideFilterMethod<Data, State>;
}

// This distributes union types, so if state is A | B this gives ClientSideFilter<A> | ClientSideFilter<B>
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type DistributeClientFilter<Data, State> = State extends any
    ? ClientSideFilter<Data, State>
    : never;

export type DistributeServerFilter<
    Data,
    State,
    DbData extends Record<string, unknown>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
> = State extends any ? ServerSideFilter<Data, State, DbData> : never;

export type FilterBase<Data, State> =
    | DistributeClientFilter<Data, State>
    | DistributeServerFilter<Data, State, Record<string, unknown>>;

export const defaultToString = (value: unknown): string => {
    if (typeof value === "string") {
        return value;
    }

    return JSON.stringify(value);
};
