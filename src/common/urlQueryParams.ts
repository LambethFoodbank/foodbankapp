"use client";

import queryString, { ParsedQuery } from "query-string";
import { returnPathQueryParam } from "@/common/constants";

export type UrlQueryParamsRecord = ParsedQuery;

export const parseQueryParams = (queryParams: string): UrlQueryParamsRecord => {
    return queryString.parse(queryParams, { arrayFormat: "bracket" });
};

export const stringifyQueryParams = (params: UrlQueryParamsRecord): string => {
    return queryString.stringify(params, { arrayFormat: "bracket" });
};

export const readArrayParamFromQuery = (
    params: UrlQueryParamsRecord,
    paramName: string
): string[] | null => {
    const paramValue = params[paramName];

    if (paramValue) {
        if (typeof paramValue === "string") {
            return [paramValue];
        } else if (Array.isArray(paramValue)) {
            return paramValue.filter((val): val is string => val !== null);
        }
    }
    return null;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const areStringArraysEqual = (arr1: any[], arr2: any[]): boolean => {
    return arr1.length === arr2.length && arr1.every((val, index) => arr2[index] === val);
};

const areRecordsEqual = (obj1: UrlQueryParamsRecord, obj2: UrlQueryParamsRecord): boolean => {
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);

    if (keys1.length !== keys2.length) {
        return false;
    }

    return keys1.every(
        (key) =>
            obj1[key] === obj2[key] ||
            (Array.isArray(obj1[key]) &&
                Array.isArray(obj2[key]) &&
                areStringArraysEqual(obj1[key], obj2[key]))
    );
};

export const mergeParamsIntoURL = (paramsToUpdate: UrlQueryParamsRecord): void => {
    const paramsInURL = parseQueryParams(window.location.search);

    const mergedParams = {
        ...paramsInURL,
        ...paramsToUpdate,
    };
    const nonEmptyMergedParams = Object.fromEntries(
        Object.entries(mergedParams).filter(
            ([_key, value]) =>
                (Array.isArray(value) && value.length > 0) || (!Array.isArray(value) && value)
        )
    );

    if (!areRecordsEqual(paramsInURL, nonEmptyMergedParams)) {
        const queryStringified = stringifyQueryParams(nonEmptyMergedParams);

        // App Router doesn't support shallow routing, so router.push would reload the page
        window.history.pushState({}, "", `${window.location.pathname}?${queryStringified}`);
    }
};

const encodeCurrentPathAndQueryParams = (windowLocation: Location): string => {
    const currentPath = windowLocation.pathname;
    const currentQueryParams = windowLocation.search;

    return encodeURIComponent(`${currentPath}${currentQueryParams}`);
};

export const generateReturnPathQueryParam = (windowLocation: Location): string => {
    const paramsRecord: Record<string, string> = {};
    paramsRecord[returnPathQueryParam] = encodeCurrentPathAndQueryParams(windowLocation);
    return stringifyQueryParams(paramsRecord);
};

export const readReturnPathQueryParam = (windowLocation: Location): string | null => {
    const params = parseQueryParams(windowLocation.search);
    if (params[returnPathQueryParam]) {
        return params[returnPathQueryParam] as string;
    }
    return null;
};
