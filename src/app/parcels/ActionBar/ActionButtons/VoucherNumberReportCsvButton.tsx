"use client";

import React from "react";
import { logErrorReturnLogId } from "@/logger/logger";
import { Dayjs } from "dayjs";
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
import { getDbDate } from "@/common/format";

const getMissingVoucherNumberParcelIdsAndStatus = async (
    fromDate: Dayjs,
    toDate: Dayjs
): Promise<{ data: idAndStatus[]; error: FetchReportError | null }> => {
    const { data: idAndStatusList, error: idFetchError } = await supabase
        .from("parcels_plus")
        .select("parcel_id, last_status_event_name")
        .gte("packing_date", getDbDate(fromDate))
        .lte("packing_date", getDbDate(toDate))
        // eslint-disable-next-line quotes
        .or('voucher_number.not.ilike.E%, voucher_number.ilike."", voucher_number.is.null')
        .eq("client_is_active", true)
        .not("parcel_id", "is", null);

    if (idFetchError) {
        const logId = await logErrorReturnLogId(
            "Failed to fetch parcel IDs and statuses for Missing Voucher Number Report",
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

const getMissingVoucherNumberRawParcelList = async (
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
        .order("client_id");
    if (parcelFetchError) {
        const logId = await logErrorReturnLogId(
            "Failed to fetch Missing Voucher Number Report parcel data",
            {
                error: parcelFetchError,
            }
        );
        return {
            data: [],
            error: {
                type: "failedToFetchRows",
                logId: logId,
            },
        };
    }

    if (!rawParcelList || rawParcelList.length === 0) {
        const logId = await logErrorReturnLogId(
            "No parcels with specified status to create Missing Voucher Number report"
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

const getMissingVoucherNumberReportData = async (
    fromDate: Dayjs,
    toDate: Dayjs
): Promise<FetchReportResult> => {
    const { data: idAndStatusList, error: idAndStatusError } =
        await getMissingVoucherNumberParcelIdsAndStatus(fromDate, toDate);

    if (idAndStatusError) {
        return {
            data: null,
            error: idAndStatusError,
        };
    }

    const { data: rawParcelList, error: rawParcelError } =
        await getMissingVoucherNumberRawParcelList(idAndStatusList);

    if (rawParcelError) {
        return {
            data: null,
            error: rawParcelError,
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
}: ButtonProps): React.ReactElement<any> => {
    const props: ButtonProps = {
        fromDate: fromDate,
        toDate: toDate,
        parcels: [],
        onFileCreationCompleted: onFileCreationCompleted,
        onFileCreationFailed: onFileCreationFailed,
        disabled: disabled,
        getReportDataByDate: getMissingVoucherNumberReportData,
        fileName: "MissingVoucherNumberReport.csv",
        reportType: "dateInterval",
    };
    return ReportCsvButton(props);
};

export default MissingVoucherNumberReportCsvButton;
