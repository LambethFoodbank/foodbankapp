"use client";

import { ReadonlyURLSearchParams } from "next/navigation";
import queryString, { ParsedQuery } from "query-string";

export const parseQueryParams = (searchParams: ReadonlyURLSearchParams): ParsedQuery => {
    const parsedQuery = queryString.parse(searchParams.toString());
    return parsedQuery;
};

export const readArrayParamFromQuery = (
    params: ParsedQuery,
    paramName: string
): string[] | null => {
    const paramValue = params[paramName];

    if (paramValue) {
        if (typeof paramValue === "string") {
            return [paramValue];
        } else if (Array.isArray(paramValue)) {
            return paramValue.filter((method): method is string => method !== null);
        }
    }
    return null;
};

const areRecordsEqual = (obj1: ParsedQuery<string>, obj2: ParsedQuery<string>): boolean => {
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);

    if (keys1.length !== keys2.length) {
        return false;
    }

    return keys1.every((key) => obj1[key] === obj2[key]);
};

export const mergeParamsIntoURL = (
    searchParams: ReadonlyURLSearchParams,
    paramsToUpdate: Record<string, string | null | string[]>
): void => {
    const paramsInURL = queryString.parse(searchParams.toString());

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

    console.log("QQ Potentially updating URL...");
    console.dir(paramsInURL);
    console.dir(nonEmptyMergedParams);

    if (!areRecordsEqual(paramsInURL, nonEmptyMergedParams)) {
        console.log("Updating URL with new params:", nonEmptyMergedParams);

        const queryStringified = queryString.stringify(nonEmptyMergedParams);

        // App Router doesn't support shallow routing, so router.push would reload the page
        window.history.pushState({}, "", `${window.location.pathname}?${queryStringified}`);
    }
};
