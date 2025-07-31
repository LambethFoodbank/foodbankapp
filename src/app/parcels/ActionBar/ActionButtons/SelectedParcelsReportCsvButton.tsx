"use client";

import React from "react";
import { logErrorReturnLogId } from "@/logger/logger";
import ReportCsvButton, { ButtonProps, convertRawParcelListToReportResult, FetchReportError, FetchReportErrorType, FetchReportResult, getParcelIdsAndStatusQuery, getRawParcelListQuery, idAndStatus, rawParcel, ReportRow } from "./ReportCsvButton";

const getSelectedParcelsParcelIdsAndStatus = async (
    parcelIds: string[]
): Promise<idAndStatus[] | FetchReportError> => {
    const {data: idAndStatusList, error: idFetchError} = await getParcelIdsAndStatusQuery(undefined, undefined, parcelIds)
        .in("parcel_id", parcelIds);

    if (idFetchError) {
        const logId = await logErrorReturnLogId(
            "Failed to fetch signposting parcel IDs and statuses",
            {
                error: idFetchError,
            }
        );
        return {
            type: "failedToFetchParcelIds",
            logId,
        };
    }
    return idAndStatusList;

};
const getSelectedParcelsRawParcelList = async (
    parcelIds: string[]
): Promise<rawParcel[] | FetchReportError> => {
    const { data: rawParcelList, error: parcelFetchError } = await getRawParcelListQuery()
        .in("primary_key", parcelIds)
        .order("packing_date")
        .order("primary_key");

    if (parcelFetchError) {
        const logId = await logErrorReturnLogId(
            "Failed to fetch parcel data",
            {
                error: parcelFetchError,
            }
        );
        return {
            type: "failedToFetchRows",
            logId,
        };
    }
    return rawParcelList;
};
const getSelectedParcelsReportData = async(
    parcelIds: string[]
): Promise<FetchReportResult> => {
    const idAndStatusList = await getSelectedParcelsParcelIdsAndStatus(parcelIds);

    if ("type" in idAndStatusList) {
            return {
                data: null,
                error: idAndStatusList
            };
        }
    
        const rawParcelList = await getSelectedParcelsRawParcelList(parcelIds);
    
        if ("type" in rawParcelList) {
            return {
                data: null,
                error: rawParcelList
            };
        }
    
        return convertRawParcelListToReportResult(rawParcelList, idAndStatusList);
}
const SelectedParcelsReportCsvButton = ({
    onFileCreationCompleted,
    onFileCreationFailed,
    parcels,
}: ButtonProps): React.ReactElement => {
    const props: ButtonProps = {
        parcels: parcels,
        onFileCreationCompleted: onFileCreationCompleted,
        onFileCreationFailed: onFileCreationFailed,
        getReportDataByList: getSelectedParcelsReportData,
        fileName: "SelectedParcels.csv",
    };
    return ReportCsvButton(props);
};

export default SelectedParcelsReportCsvButton;
