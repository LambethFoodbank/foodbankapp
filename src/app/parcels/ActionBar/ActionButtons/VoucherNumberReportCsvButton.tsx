"use client";

import React from "react";
import supabase from "@/supabaseClient";
import CsvButton, {
    formatNumberAsStringForCsv,
} from "@/components/FileGenerationButtons/CsvButton";
import { FileGenerationDataFetchResponse } from "@/components/FileGenerationButtons/common";
import { logErrorReturnLogId } from "@/logger/logger";
import { formatDatetimeAsDate, getDbDate } from "@/common/format";
import { Dayjs } from "dayjs";
import {
    formatAddressFromClientDetails,
    formatBabyProducts,
    formatBreakdownOfAdultsFromFamilyDetails,
    formatBreakdownOfChildrenFromFamilyDetails,
    formatHouseholdFromFamilyDetails,
    formatHygieneProducts,
    formatRequirementsByCanonicalOrder,
} from "@/app/clients/getExpandedClientDetails";
import { dietaryRequirementOptions } from "@/app/clients/form/formSections/DietaryRequirementCard";
import { otherRequirementOptions } from "@/app/clients/form/formSections/OtherItemsCard";
import { petFoodOptions } from "@/app/clients/form/formSections/PetFoodCard";
import { cookingFacilitiesOptions } from "@/app/clients/form/formSections/CookingFacilitiesCard";
import { signpostingCallOptions } from "@/app/clients/form/formSections/SignpostingCallCard";

type FetchMissingVoucherNumberReportResult =
    | {
          data: VoucherReportRow[];
          error: null;
      }
    | {
          data: null;
          error: FetchMissingVoucherNumberReportError;
      };

export interface FetchMissingVoucherNumberReportError {
    type: FetchMissingVoucherNumberReportErrorType;
    logId: string;
}

type FetchMissingVoucherNumberReportErrorType =
    | "failedToFetchMissingVoucherNumberRows"
    | "failedToFetchMissingVoucherNumberParcelIds"
    | "noParcelsFound";

type VoucherReportRow = {
    voucherNumber: string;
    packingDate: string;
    fullName: string;
    signpostingCallRequired: boolean;
    flaggedForAttention: boolean;
    phoneNumber: string;
    signpostingCallReasons: string;
    address: string;
    parcelStatus: string;
    deliveryOrCollection: string;
    deliveryCollectionDate: string;
    deliveryInstructions: string;
    extraInformation: string;
    notes: string;
    cookingFacilities: string;
    dietaryRequirements: string;
    hygieneProducts: string;
    babyProducts: string;
    petFood: string;
    otherItems: string;
    household: string;
    adults: string;
    children: string;
    parcelListType: string;
    clientIsActive: boolean;
    recordCreatedOn: string;
};

const getMissingVoucherNumberReportData = async (
    fromDate: Dayjs,
    toDate: Dayjs
): Promise<FetchMissingVoucherNumberReportResult> => {
    // Find IDs of non-deleted parcels in the period. This is done before the complex query because
    // joining clients and families to the view does not behave as expected.
    const { data: idAndStatusList, error: idFetchError } = await supabase
        .from("parcels_plus")
        .select("parcel_id, last_status_event_name")
        .gte("packing_date", getDbDate(fromDate))
        .lte("packing_date", getDbDate(toDate))
        // eslint-disable-next-line quotes
        .or('voucher_number.not.ilike.E%, voucher_number.eq."", voucher_number.is.null')
        .not("client_full_name", "ilike", "%Deleted Client%")
        .eq("client_is_active", true);

    if (idFetchError) {
        const logId = await logErrorReturnLogId("Failed to fetch Voucher parcel IDs and statuses", {
            error: idFetchError,
        });
        return {
            data: null,
            error: {
                type: "failedToFetchMissingVoucherNumberParcelIds",
                logId,
            },
        };
    }

    const { data: rawParcelList, error: parcelFetchError } = await supabase
        .from("parcels")
        .select(
            `
            primary_key,
            voucher_number,
            packing_date,
            created_at,
            collection_datetime,
            collection_centre:collection_centres(
                name,
                is_shown
            ),
            list_type,

            client:clients(
                full_name,
                is_active,
                signposting_call_required,
                flagged_for_attention,
                phone_number,
                signposting_call_reasons,
                delivery_instructions,
                extra_information,
                notes,
                address_1,
                address_2,
                address_town,
                address_county,
                address_postcode,
                cooking_facilities,
                dietary_requirements,
                hygiene_tampons,
                hygiene_pads,
                hygiene_other_items,
                baby_food,
                baby_formula,
                baby_nappies,
                baby_other_items,
                pet_food,
                other_items,

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
        .in(
            "primary_key",
            idAndStatusList.map((idAndStatus) => idAndStatus.parcel_id).filter((id) => id !== null)
        )
        .order("packing_date")
        .order("client_id");

    if (parcelFetchError) {
        const logId = await logErrorReturnLogId("Failed to fetch missing voucher number rows", {
            error: parcelFetchError,
        });
        return {
            data: null,
            error: {
                type: "failedToFetchMissingVoucherNumberRows",
                logId,
            },
        };
    }

    if (!rawParcelList || rawParcelList.length === 0) {
        const logId = await logErrorReturnLogId(
            "No parcels with current selection to create missing voucher report",
            {
                error: parcelFetchError,
            }
        );
        return {
            data: null,
            error: {
                type: "noParcelsFound",
                logId,
            },
        };
    }

    return {
        error: null,
        data: rawParcelList
            .filter((rawParcel) => !!rawParcel.client)
            .map((rawParcel): VoucherReportRow => {
                return {
                    voucherNumber: rawParcel.voucher_number ?? "",
                    packingDate: formatDatetimeAsDate(rawParcel.packing_date),
                    fullName: rawParcel.client?.full_name ?? "(error)",
                    signpostingCallRequired: rawParcel.client?.signposting_call_required ?? false,
                    flaggedForAttention: rawParcel.client?.flagged_for_attention ?? false,
                    phoneNumber: rawParcel.client
                        ? formatNumberAsStringForCsv(rawParcel.client.phone_number)
                        : "",
                    signpostingCallReasons: formatRequirementsByCanonicalOrder(
                        rawParcel.client?.signposting_call_reasons ?? null,
                        signpostingCallOptions
                    ),
                    address: rawParcel.client
                        ? formatAddressFromClientDetails(rawParcel.client)
                        : "",
                    parcelStatus:
                        idAndStatusList.find(
                            (idAndStatus) => idAndStatus.parcel_id === rawParcel.primary_key
                        )?.last_status_event_name ?? "(none)",
                    deliveryOrCollection: rawParcel.collection_centre?.is_shown
                        ? rawParcel.collection_centre?.name
                        : `${rawParcel.collection_centre?.name} (inactive)`,
                    deliveryCollectionDate: formatDatetimeAsDate(rawParcel.collection_datetime),
                    deliveryInstructions: rawParcel.client?.delivery_instructions ?? "",
                    extraInformation: rawParcel.client?.extra_information ?? "",
                    notes: rawParcel.client?.notes ?? "",
                    cookingFacilities: formatRequirementsByCanonicalOrder(
                        rawParcel.client?.cooking_facilities ?? null,
                        cookingFacilitiesOptions
                    ),
                    dietaryRequirements: formatRequirementsByCanonicalOrder(
                        rawParcel.client?.dietary_requirements ?? null,
                        dietaryRequirementOptions
                    ),
                    hygieneProducts: formatHygieneProducts(
                        rawParcel.client?.hygiene_tampons ?? null,
                        rawParcel.client?.hygiene_pads ?? null,
                        rawParcel.client?.hygiene_other_items ?? []
                    ),
                    babyProducts: formatBabyProducts(
                        rawParcel.client?.baby_food ?? null,
                        rawParcel.client?.baby_formula ?? null,
                        rawParcel.client?.baby_nappies ?? null,
                        rawParcel.client?.baby_other_items ?? []
                    ),
                    petFood: formatRequirementsByCanonicalOrder(
                        rawParcel.client?.pet_food ?? null,
                        petFoodOptions
                    ),
                    otherItems: formatRequirementsByCanonicalOrder(
                        rawParcel.client?.other_items ?? null,
                        otherRequirementOptions
                    ),
                    household: rawParcel.client
                        ? formatHouseholdFromFamilyDetails(rawParcel.client.family)
                        : "",
                    adults: rawParcel.client
                        ? formatBreakdownOfAdultsFromFamilyDetails(rawParcel.client.family)
                        : "",
                    children: rawParcel.client
                        ? formatBreakdownOfChildrenFromFamilyDetails(rawParcel.client.family)
                        : "",
                    parcelListType: rawParcel.list_type,
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
    onFileCreationFailed: (error: FetchMissingVoucherNumberReportError) => void;
    disabled: boolean;
}

const MissingVoucherNumberReportCsvButton = ({
    fromDate,
    toDate,
    onFileCreationCompleted,
    onFileCreationFailed,
    disabled,
}: ButtonProps): React.ReactElement => {
    const fetchDataAndFileName = async (): Promise<
        FileGenerationDataFetchResponse<
            VoucherReportRow[],
            FetchMissingVoucherNumberReportErrorType
        >
    > => {
        const { data: requiredData, error } = await getMissingVoucherNumberReportData(
            fromDate,
            toDate
        );
        if (error) {
            return { data: null, error };
        }
        return {
            data: { fileData: requiredData, fileName: "MissingVoucherNumberReport.csv" },
            error: null,
        };
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

export default MissingVoucherNumberReportCsvButton;
