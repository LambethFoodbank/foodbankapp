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
import supabase from "@/supabaseClient";

const getSelectedParcelsParcelIdsAndStatus = async (
    parcelIds: string[]
): Promise<{ data: idAndStatus[]; error: FetchReportError | null }> => {
    const { data: idAndStatusList, error: idFetchError } = await getParcelIdsAndStatusQuery({
        parcelIds,
    }).in("parcel_id", parcelIds);

    if (idFetchError) {
        const logId = await logErrorReturnLogId(
            "Failed to fetch signposting parcel IDs and statuses for Selected Parcels Report ",
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
): Promise<{ data: rawParcel[]; error: FetchReportError | null }> => {
    console.log(parcelIds);
    const { data: rawParcelList, error: parcelFetchError } = await supabase.from("parcels").select(getRawParcelListQuery).limit(1, { foreignTable: "clients" })
        .in("primary_key", parcelIds)
        .order("packing_date")
        .order("primary_key");
    console.log(rawParcelList, parcelFetchError);
    if (parcelFetchError) {
        const logId = await logErrorReturnLogId(
            "Failed to fetch Selected Parcels Report Parcel data",
            {
                error: parcelFetchError,
            }
        );
        return {
            data: [],
            error: {
                type: "failedToFetchRows",
                logId,
            },
        };
    }
    if (!rawParcelList || rawParcelList.length === 0) {
        const logId = await logErrorReturnLogId(
            "No parcels with specified status to create Selected Parcels report"
        );
        return {
            data: [],
            error: {
                type: "noRowsForInterval",
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
    const { data: idAndStatusList, error: idAndStatusError } =
        await getSelectedParcelsParcelIdsAndStatus(parcelIds);

    if (idAndStatusError) {
        console.log("idAndStatus Error");
        return {
            data: null,
            error: idAndStatusError,
        };
    }

    const { data: rawParcelList, error: rawParcelError } =
        await getSelectedParcelsRawParcelList(parcelIds);

    if (rawParcelError) {
        console.log("rawParcel Error");
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
    fromDate,
    toDate,
    reportType,
}: ButtonProps): React.ReactElement => {
    const props: ButtonProps = {
        fromDate: null,
        toDate: null,
        parcels: parcels,
        onFileCreationCompleted: onFileCreationCompleted,
        onFileCreationFailed: onFileCreationFailed,
        getReportDataByList: getSelectedParcelsReportData,
        fileName: "SelectedParcels.csv",
        reportType: "parcelList",
    };
    return ReportCsvButton(props);
};

export default SelectedParcelsReportCsvButton;
