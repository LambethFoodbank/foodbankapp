"use client";

import React from "react";
import { logErrorReturnLogId } from "@/logger/logger";
import { Dayjs } from "dayjs";
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

const getMissingVoucherNumberParcelIdsAndStatus = async (
    fromDate: Dayjs,
    toDate: Dayjs
): Promise<idAndStatus[] | FetchReportError> => {
    const { data: idAndStatusList, error: idFetchError } = await getParcelIdsAndStatusQuery(
        fromDate,
        toDate
    )
        // eslint-disable-next-line quotes
        .or('voucher_number.not.ilike.E%, voucher_number.eq."", voucher_number.is.null')
        // eslint-disable-next-line quotes
        .or('last_status_event_name.neq."Parcel Deleted",last_status_event_name.is.null')
        .eq("client_is_active", true);

    if (idFetchError) {
        const logId = await logErrorReturnLogId("Failed to fetch parcel IDs and statuses", {
            error: idFetchError,
        });
        return {
            type: "failedToFetchParcelIds",
            logId,
        };
    }
    return idAndStatusList;
};

const getMissingVoucherNumberRawParcelList = async (
    idAndStatusList: idAndStatus[]
): Promise<rawParcel[] | FetchReportError> => {
    const { data: rawParcelList, error: parcelFetchError } = await getRawParcelListQuery()
        .in(
            "primary_key",
            idAndStatusList.map((idAndStatus) => idAndStatus.parcel_id).filter((id) => id !== null)
        )
        .order("packing_date")
        .order("client_id");

    if (parcelFetchError) {
        const logId = await logErrorReturnLogId("Failed to fetch parcel data", {
            error: parcelFetchError,
        });
        return {
            type: "failedToFetchRows",
            logId,
        };
    }
    return rawParcelList;
};

const getMissingVoucherNumberReportData = async (
    fromDate: Dayjs,
    toDate: Dayjs
): Promise<FetchReportResult> => {
    const idAndStatusList = await getMissingVoucherNumberParcelIdsAndStatus(fromDate, toDate);

    if ("type" in idAndStatusList) {
        return {
            data: null,
            error: idAndStatusList,
        };
    }

    const rawParcelList = await getMissingVoucherNumberRawParcelList(idAndStatusList);

    if ("type" in rawParcelList) {
        return {
            data: null,
            error: rawParcelList,
        };
    }

    return convertRawParcelListToReportResult(rawParcelList, idAndStatusList);
};

const MissingVoucherNumberReportCsvButton = ({
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
        getReportDataByDate: getMissingVoucherNumberReportData,
        fileName: "MissingVoucherNumberReport.csv",
    };
    return ReportCsvButton(props);
};

export default MissingVoucherNumberReportCsvButton;
