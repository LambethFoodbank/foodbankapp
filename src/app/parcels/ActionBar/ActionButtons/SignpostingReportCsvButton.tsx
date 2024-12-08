"use client";

import React from "react";
import supabase from "@/supabaseClient";
import CsvButton, {
    formatNumberAsStringForCsv,
} from "@/components/FileGenerationButtons/CsvButton";
import { FileGenerationDataFetchResponse } from "@/components/FileGenerationButtons/common";
import { logErrorReturnLogId } from "@/logger/logger";
import { formatDatetimeAsDate, getDbDate } from "@/common/format";
import {
    formatAddressFromClientDetails,
    formatBreakdownOfAdultsFromFamilyDetails,
    formatBreakdownOfChildrenFromFamilyDetails,
    formatHouseholdFromFamilyDetails,
} from "@/app/clients/getExpandedClientDetails";
import { Dayjs } from "dayjs";

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
    fullName: string;
    signpostingCallRequired: boolean;
    flaggedForAttention: boolean;
    phoneNumber: string;
    address: string;
    deliveryOrCollection: string;
    deliveryCollectionDate: string;
    deliveryInstructions: string;
    household: string;
    adults: string;
    children: string;
    listType: string;
    clientIsActive: boolean;
    recordCreatedOn: string;
};

const getSignpostingReportData = async (
    fromDate: Dayjs,
    toDate: Dayjs
): Promise<FetchSignpostingReportResult> => {
    const { data: rawParcelList, error } = await supabase
        .from("parcels")
        .select(
            `
            voucher_number,
            packing_date,
            created_at,
            collection_datetime,
            collection_centre:collection_centres (
                name,
                is_shown
            ),
            list_type,
            client:clients(
                primary_key,
                full_name,
                is_active,
                signposting_call_required,
                flagged_for_attention,
                phone_number,
                delivery_instructions,
                address_1,
                address_2,
                address_town,
                address_county,
                address_postcode,

                family:families(
                    birth_year,
                    birth_month,
                    gender,
                    recorded_as_child
                )
            )
            `
        )
        .limit(1, { foreignTable: "clients" })
        .eq("client.is_active", true)
        .eq("client.signposting_call_required", true)
        .gte("packing_date", getDbDate(fromDate))
        .lte("packing_date", getDbDate(toDate))
        .order("packing_date")
        .order("client_id");

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
        data: rawParcelList
            .filter((rawParcel) => !!rawParcel.client)
            .map((rawParcel): SignpostingReportRow => {
                return {
                    voucherNumber: rawParcel.voucher_number ?? "",
                    packingDate: formatDatetimeAsDate(rawParcel.packing_date),
                    fullName: rawParcel.client?.full_name ?? "(error)",
                    signpostingCallRequired: rawParcel.client?.signposting_call_required ?? false,
                    flaggedForAttention: rawParcel.client?.flagged_for_attention ?? false,
                    phoneNumber: rawParcel.client
                        ? formatNumberAsStringForCsv(rawParcel.client.phone_number)
                        : "",
                    address: rawParcel.client
                        ? formatAddressFromClientDetails(rawParcel.client)
                        : "",
                    deliveryOrCollection: rawParcel.collection_centre?.is_shown
                        ? rawParcel.collection_centre?.name
                        : `${rawParcel.collection_centre?.name} (inactive)`,
                    deliveryCollectionDate: formatDatetimeAsDate(rawParcel.collection_datetime),
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
                    listType: rawParcel.list_type,
                    clientIsActive: rawParcel.client?.is_active ?? false,
                    recordCreatedOn: formatDatetimeAsDate(rawParcel.created_at),
                };
            }),
    };
};

interface ButtonProps {
    fromDate: Dayjs;
    toDate: Dayjs;
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
        return { data: { fileData: requiredData, fileName: "SignpostingReport.csv" }, error: null };
    };

    return (
        <CsvButton
            fetchDataAndFileName={fetchDataAndFileName}
            csvConfig={{ useKeysAsHeaders: true, quoteStrings: true }}
            onFileCreationCompleted={onFileCreationCompleted}
            onFileCreationFailed={onFileCreationFailed}
            disabled={disabled}
            formSubmitButton={true}
        />
    );
};

export default SignpostingReportCsvButton;
