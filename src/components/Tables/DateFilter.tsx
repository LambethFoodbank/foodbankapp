import React from "react";
import { ServerSideFilter, ServerSideFilterMethod } from "./Filters";
import DateRangeInputs, { DateRangeState, isDateRangeValid } from "../DateInputs/DateRangeInputs";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { UrlQueryParamsRecord, readArrayParamFromQuery } from "@/common/urlQueryParams";

interface DateFilterProps<Data, DbData extends Record<string, unknown>> {
    key: string;
    rowKey?: keyof Data;
    label: string;
    method: ServerSideFilterMethod<DbData, DateRangeState>;
    initialState: DateRangeState;
    shouldPersistOnClear?: boolean;
    isDisabled?: boolean;
    isHidden?: boolean;
    isHiddenInUrl?: boolean;
}

const areDateRangesIdentical = (
    dateRangeA: DateRangeState,
    dateRangeB: DateRangeState
): boolean => {
    return (
        areDaysIdentical(dateRangeA.from, dateRangeB.from) &&
        areDaysIdentical(dateRangeA.to, dateRangeB.to)
    );
};

export const areDaysIdentical = (dayA: dayjs.Dayjs | null, dayB: dayjs.Dayjs | null): boolean => {
    return dayA && dayB ? dayA.isSame(dayB, "day") : dayA === dayB;
};

export const serverSideDateFilter = <Data, DbData extends Record<string, unknown>>({
    key,
    method,
    initialState,
    shouldPersistOnClear = false,
    isDisabled = false,
    isHidden = false,
    isHiddenInUrl = false,
}: DateFilterProps<Data, DbData>): ServerSideFilter<Data, DateRangeState, DbData> => {
    return {
        key: key,
        state: initialState,
        initialState: initialState,
        method,
        shouldPersistOnClear: shouldPersistOnClear,
        isDisabled: isDisabled,
        isHidden: isHidden,
        isHiddenInUrl: isHiddenInUrl,
        areStatesIdentical: (stateA, stateB) => areDateRangesIdentical(stateA, stateB),
        filterComponent: function (
            state: DateRangeState,
            setState: (state: DateRangeState) => void,
            isDisabled: boolean
        ): React.ReactNode {
            return isHidden ? null : (
                <DateRangeInputs
                    key={key as string}
                    range={state}
                    setRange={setState}
                    isDisabled={isDisabled}
                />
            );
        },
        generateUrlParam: function (): UrlQueryParamsRecord {
            const paramRecord: UrlQueryParamsRecord = {};

            if (this.isHiddenInUrl) {
                paramRecord[key as string] = null;
            } else {
                const { from, to } = this.state;
                paramRecord[key as string] = [from.format("YYYY-MM-DD"), to.format("YYYY-MM-DD")];
            }
            return paramRecord;
        },
        readStateFromUrlQueryParams: (urlParams: UrlQueryParamsRecord) => {
            dayjs.extend(customParseFormat);

            const dateParamValues = readArrayParamFromQuery(urlParams, key as string);
            if (dateParamValues && dateParamValues.length === 2) {
                const from = dayjs(dateParamValues[0] as string, "YYYY-MM-DD");
                const to = dayjs(dateParamValues[1] as string, "YYYY-MM-DD");
                if (isDateRangeValid(from, to)) {
                    return { from: from, to: to };
                }
            }

            return null;
        },
    };
};
