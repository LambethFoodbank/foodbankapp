"use client";

import React from "react";
import { logErrorReturnLogId } from "@/logger/logger";
import ReportCsvButton, {
    ButtonProps,
    convertRawParcelListToReportResult,
    FetchReportError,
    FetchReportResult,
    getRawParcelListQuery,
    idAndStatus,
    rawParcel,
} from "./ReportCsvButton";
import supabase from "@/supabaseClient";

const getSelectedParcelsParcelIdsAndStatus = async (
    parcelIds: string[]
): Promise<{ data: idAndStatus[]; error: FetchReportError | null }> => {
    const { data: idAndStatusList, error: idFetchError } = await supabase
        .from("parcels_plus")
        .select("parcel_id, last_status_event_name")
        .eq("client_is_active", true)
        .not("parcel_id", "is", null)
        .in("parcel_id", parcelIds);

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
    idAndStatusList: idAndStatus[]
): Promise<{ data: rawParcel[]; error: FetchReportError | null }> => {
    const { data: rawParcelList, error: parcelFetchError } = await supabase
        .from("parcels")
        .select(getRawParcelListQuery)
        .limit(1, { foreignTable: "clients" })
        .in(
            "primary_key",
            idAndStatusList.map((idAndStatus) => idAndStatus.parcel_id).filter((id) => id !== null)
        )
        .order("packing_date")
        .order("primary_key");
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
        return {
            data: null,
            error: idAndStatusError,
        };
    }

    const { data: rawParcelList, error: rawParcelError } =
        await getSelectedParcelsRawParcelList(idAndStatusList);

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
}: ButtonProps): React.ReactElement<any> => {
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
