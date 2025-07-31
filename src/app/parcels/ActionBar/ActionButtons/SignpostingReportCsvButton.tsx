"use client";

import React from "react";
import CsvButton from "@/components/FileGenerationButtons/CsvButton";
import { FileGenerationDataFetchResponse } from "@/components/FileGenerationButtons/common";
import { logErrorReturnLogId } from "@/logger/logger";
import { Dayjs } from "dayjs";
import ReportCsvButton, { ButtonProps, convertRawParcelListToReportResult, FetchReportError, FetchReportErrorType, FetchReportResult, getParcelIdsAndStatusQuery, getRawParcelListQuery, idAndStatus, rawParcel, ReportRow } from "./ReportCsvButton";

const getSignpostingParcelIdsAndStatus = async (
    fromDate: Dayjs,
    toDate: Dayjs
): Promise<idAndStatus[] | FetchReportError> => {
    const {data: idAndStatusList, error: idFetchError} = await getParcelIdsAndStatusQuery(fromDate, toDate)
        .or('last_status_event_name.neq."Parcel Deleted",last_status_event_name.is.null');

    if (idFetchError) {
        const logId = await logErrorReturnLogId(
            "Failed to fetch parcel IDs and statuses",
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
}

const getSignpostingRawParcelList = async (
    idAndStatusList: idAndStatus[]
): Promise<rawParcel[] | FetchReportError> => {
    const { data: rawParcelList, error: parcelFetchError } = await getRawParcelListQuery()
        .in(
            "primary_key",
            idAndStatusList.map((idAndStatus) => idAndStatus.parcel_id).filter((id) => id !== null)
            )
        .eq("client.is_active", true)
        .eq("client.signposting_call_required", true)
        .order("packing_date")
        .order("client_id");

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



const getSignpostingReportData = async (
    fromDate: Dayjs,
    toDate: Dayjs
): Promise<FetchReportResult> => {
    const idAndStatusList = await getSignpostingParcelIdsAndStatus(fromDate, toDate);

    if ("type" in idAndStatusList) {
        return {
            data: null,
            error: idAndStatusList
        };
    }

    const rawParcelList = await getSignpostingRawParcelList(idAndStatusList);

    if ("type" in rawParcelList) {
        return {
            data: null,
            error: rawParcelList
        };
    }

    return convertRawParcelListToReportResult(rawParcelList, idAndStatusList);
};

const SignpostingReportCsvButton = ({
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
        getReportDataByDate: getSignpostingReportData,
        fileName: "SignpostingReport.csv",
    };
    return ReportCsvButton(props);
};

export default SignpostingReportCsvButton;
