"use client";

import React from "react";
import { logErrorReturnLogId } from "@/logger/logger";
import ReportCsvButton, {
    ButtonProps,
    convertRawParcelListToReportResult,
    FetchReportError,
    FetchReportResult,
    getParcelIdsAndStatusQuery,
    getRawParcelListQuery,
    idAndStatus,
    rawParcel,
} from "./ReportCsvButton";

const getSelectedParcelsParcelIdsAndStatus = async (
    parcelIds: string[]
): Promise<{ data:idAndStatus[], error: FetchReportError | null}> => {
    const { data: idAndStatusList, error: idFetchError } = await getParcelIdsAndStatusQuery({
        parcelIds
    }).in("parcel_id", parcelIds);

    if (idFetchError) {
        const logId = await logErrorReturnLogId(
            "Failed to fetch signposting parcel IDs and statuses",
            {
                error: idFetchError,
            }
        );
        return {
            data: [],
            error: {
                type: "failedToFetchParcelIds",
                logId: logId,
            },
        };
    }
    return {
        data: idAndStatusList,
        error: null,
    };
};
const getSelectedParcelsRawParcelList = async (
    parcelIds: string[]
): Promise<{ data: rawParcel[], error: FetchReportError | null }> => {
    const { data: rawParcelList, error: parcelFetchError } = await getRawParcelListQuery()
        .in("primary_key", parcelIds)
        .order("packing_date")
        .order("primary_key");

    if (parcelFetchError) {
        const logId = await logErrorReturnLogId("Failed to fetch parcel data", {
            error: parcelFetchError,
        });
        return {
            data: [],
            error: {
                type: "failedToFetchRows",
                logId,
            },
        };
    }
    return {
        data: rawParcelList,
        error: null,
    };
};
const getSelectedParcelsReportData = async (parcelIds: string[]): Promise<FetchReportResult> => {
    const {data: idAndStatusList, error: idAndStatusError } = await getSelectedParcelsParcelIdsAndStatus(parcelIds);

    if (idAndStatusError) {
        return {
            data: null,
            error: idAndStatusError,
        };
    }

    const {data: rawParcelList, error: rawParcelError } = await getSelectedParcelsRawParcelList(parcelIds);

    if (rawParcelError) {
        return {
            data: null,
            error: rawParcelError,
        };
    }

    return convertRawParcelListToReportResult(rawParcelList, idAndStatusList);
};
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
