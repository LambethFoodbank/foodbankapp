"use client";

import { Dayjs } from "dayjs";
import React from "react";
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
import { logErrorReturnLogId } from "@/logger/logger";

const getPendingMoreInfoParcelIdsAndStatus = async (
    fromDate: Dayjs,
    toDate: Dayjs
): Promise<{ data: idAndStatus[]; error: FetchReportError | null }> => {
    const { data: idAndStatusList, error: idFetchError } = await getParcelIdsAndStatusQuery({
        fromDate,
        toDate,
    })
        // eslint-disable-next-line quotes
        .or('last_status_event_name.eq."Pending More Info"');

    if (idFetchError) {
        const logId = await logErrorReturnLogId("Failed to fetch parcel IDs and statuses for Pending More Info Report", {
            error: idFetchError,
        });
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

const getPendingMoreInfoRawParcelList = async (
    idAndStatusList: idAndStatus[]
): Promise<{ data: rawParcel[]; error: FetchReportError | null }> => {
    const { data: rawParcelList, error: parcelFetchError } = await getRawParcelListQuery()
        .in(
            "primary_key",
            idAndStatusList.map((idAndStatus) => idAndStatus.parcel_id).filter((id) => id !== null)
        )
        .eq("client.is_active", true)
        .order("packing_date")
        .order("client_id");

    if (parcelFetchError) {
        const logId = await logErrorReturnLogId("Failed to fetch Pending More Info Report Parcel data", {
            error: parcelFetchError,
        });
        return {
            data: [],
            error: {
                type: "failedToFetchRows",
                logId: logId,
            },
        };
    }
    return {
        data: rawParcelList,
        error: null,
    };
};

const getPendingMoreInfoReportData = async (
    fromDate: Dayjs,
    toDate: Dayjs
): Promise<FetchReportResult> => {
    const { data: idAndStatusList, error: idAndStatusError } =
        await getPendingMoreInfoParcelIdsAndStatus(fromDate, toDate);

    if (idAndStatusError) {
        return {
            data: null,
            error: idAndStatusError,
        };
    }

    const { data: rawParcelList, error: rawParcelError } =
        await getPendingMoreInfoRawParcelList(idAndStatusList);

    if (rawParcelError) {
        return {
            data: null,
            error: rawParcelError,
        };
    }

    return convertRawParcelListToReportResult(rawParcelList, idAndStatusList);
};

const PendingMoreInfoReportCsvButton = ({
    fromDate,
    toDate,
    onFileCreationCompleted,
    onFileCreationFailed,
    disabled,
}: ButtonProps): React.ReactElement => {
    const props: ButtonProps = {
        fromDate: fromDate,
        toDate: toDate,
        onFileCreationCompleted: onFileCreationCompleted,
        onFileCreationFailed: onFileCreationFailed,
        disabled: disabled,
        getReportDataByDate: getPendingMoreInfoReportData,
        fileName: "PendingMoreInfoReport.csv",
    };
    return ReportCsvButton(props);
};

export default PendingMoreInfoReportCsvButton;
