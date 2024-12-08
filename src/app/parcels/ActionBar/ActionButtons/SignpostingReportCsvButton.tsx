"use client";

import React from "react";
import supabase from "@/supabaseClient";
import CsvButton from "@/components/FileGenerationButtons/CsvButton";
import { FileGenerationDataFetchResponse } from "@/components/FileGenerationButtons/common";
import { logErrorReturnLogId } from "@/logger/logger";
import { formatDateTime, formatDatetimeAsDate } from "@/common/format";
import {
    formatAddressFromClientDetails,
    formatBreakdownOfAdultsFromFamilyDetails,
    formatBreakdownOfChildrenFromFamilyDetails,
    formatHouseholdFromFamilyDetails,
} from "@/app/clients/getExpandedClientDetails";

type FetchSignpostingReportResult =
    | {
          data: SignpostingReportRow[];
          error: null;
      }
    | {
          data: null;
          error: FetchSignpostingReportError;
      };

export interface FetchSignpostingReportError {
    type: FetchSignpostingReportErrorType;
    logId: string;
}

type FetchSignpostingReportErrorType = "failedToFetchSignpostingRows";

type SignpostingReportRow = {
    voucherNumber: string;
    packingDate: string;
    createdAt: string;
    collectionDateTime: string;
    method: string;
    listType: string;
    isActive: boolean;
    fullName: string;
    phoneNumber: string;
    address: string;
    deliveryInstructions: string;
    household: string;
    adults: string;
    children: string;
};

const getSignpostingReportData = async (
    fromDate: Date,
    toDate: Date
): Promise<FetchSignpostingReportResult> => {
    const { data: rawParcelList, error } = await supabase
        .from("parcels")
        .select(
            `
    voucher_number,
    packing_date,
    created_at,
    collection_datetime,
    list_type,
    collection_centre:collection_centres (
        name,
        is_shown
     ),
    client:clients(
        primary_key,
        full_name,
        phone_number,
        delivery_instructions,
        address_1,
        address_2,
        address_town,
        address_county,
        address_postcode,
        is_active,
        flagged_for_attention,
        signposting_call_required,

        family:families(
            birth_year,
            birth_month,
            gender,
            recorded_as_child
        )
    )
    `
        )
        .eq("client.is_active", true)
        .eq("client.signposting_call_required", true)
        .gte("collection_datetime", fromDate)
        .lte("collection_datetime", toDate)
        .order("client_id")
        .order("collection_datetime");

    if (error) {
        const logId = await logErrorReturnLogId("Failed to fetch signposting rows", {
            error,
        });
        return {
            data: null,
            error: {
                type: "failedToFetchSignpostingRows",
                logId,
            },
        };
    }

    return {
        error: null,
        data: rawParcelList.map((rawParcel) => {
            return {
                voucherNumber: rawParcel.voucher_number ?? "",
                packingDate: formatDatetimeAsDate(rawParcel.packing_date),
                createdAt: formatDateTime(rawParcel.created_at),
                collectionDateTime: formatDateTime(rawParcel.collection_datetime),
                method: rawParcel.collection_centre?.is_shown
                    ? rawParcel.collection_centre?.name
                    : `${rawParcel.collection_centre?.name} (inactive)`,
                listType: rawParcel.list_type,
                isActive: rawParcel.client?.is_active ?? true,
                fullName: rawParcel.client?.full_name ?? "(error)",
                phoneNumber: rawParcel.client?.phone_number ?? "",
                address: rawParcel.client ? formatAddressFromClientDetails(rawParcel.client) : "",
                deliveryInstructions: rawParcel.client?.delivery_instructions ?? "",
                household: rawParcel.client
                    ? formatHouseholdFromFamilyDetails(rawParcel.client.family)
                    : "",
                adults: rawParcel.client
                    ? formatBreakdownOfAdultsFromFamilyDetails(rawParcel.client.family)
                    : "",
                children: rawParcel.client
                    ? formatBreakdownOfChildrenFromFamilyDetails(rawParcel.client.family)
                    : "",
            };
        }),
    };
};

interface ButtonProps {
    fromDate: Date;
    toDate: Date;
    onFileCreationCompleted: () => void;
    onFileCreationFailed: (error: FetchSignpostingReportError) => void;
    disabled: boolean;
}

const SignpostingReportCsvButton = ({
    fromDate,
    toDate,
    onFileCreationCompleted,
    onFileCreationFailed,
    disabled,
}: ButtonProps): React.ReactElement => {
    const fetchDataAndFileName = async (): Promise<
        FileGenerationDataFetchResponse<SignpostingReportRow[], FetchSignpostingReportErrorType>
    > => {
        const { data: requiredData, error } = await getSignpostingReportData(fromDate, toDate);
        if (error) {
            return { data: null, error };
        }
        return { data: { fileData: requiredData, fileName: "SignpostingReport.pdf" }, error: null };
    };

    return (
        <CsvButton
            fetchDataAndFileName={fetchDataAndFileName}
            csvConfig={{ useKeysAsHeaders: true }}
            onFileCreationCompleted={onFileCreationCompleted}
            onFileCreationFailed={onFileCreationFailed}
            disabled={disabled}
            formSubmitButton={true}
        />
    );
};

export default SignpostingReportCsvButton;
