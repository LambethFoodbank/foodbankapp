"use client";

import { Dayjs } from "dayjs";
import React from "react";
import { cookingFacilitiesOptions } from "@/app/clients/form/formSections/CookingFacilitiesCard";
import { dietaryRequirementOptions } from "@/app/clients/form/formSections/DietaryRequirementCard";
import { otherRequirementOptions } from "@/app/clients/form/formSections/OtherItemsCard";
import { petFoodOptions } from "@/app/clients/form/formSections/PetFoodCard";
import {
    formatAddressFromClientDetails,
    formatBabyProducts,
    formatBreakdownOfAdultsFromFamilyDetails,
    formatBreakdownOfChildrenFromFamilyDetails,
    formatHouseholdFromFamilyDetails,
    formatHygieneProducts,
    formatRequirementsByCanonicalOrder,
} from "@/app/clients/getExpandedClientDetails";
import { formatDatetimeAsDate, getDbDate } from "@/common/format";
import { FileGenerationDataFetchResponse } from "@/components/FileGenerationButtons/common";
import CsvButton, {
    formatNumberAsStringForCsv,
} from "@/components/FileGenerationButtons/CsvButton";
import { logErrorReturnLogId } from "@/logger/logger";
import supabase from "@/supabaseClient";
import { signpostingCallOptions } from "@/app/clients/form/formSections/SignpostingCallCard";

type FetchReportResult =
    | {
          data: ReportRow[];
          error: null;
      }
    | {
          data: null;
          error: FetchReportError;
      };

export interface FetchReportError {
    type: FetchReportErrorType;
    logId: string;
}

type FetchReportErrorType =
    | "failedToFetchRows"
    | "noRowsForInterval"
    | "failedToFetchParcelIds";

type ReportRow = {
    voucherNumber: string;
    packingDate: string;
    fullName: string;
    signpostingCallRequired: boolean;
    flaggedForAttention: boolean;
    phoneNumber: string;
    // email: string; // this is for after VFB-395 is merged
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

const getReportData = async (
    reportType: string,
    fromDate?: Dayjs,
    toDate?: Dayjs,
    parcelIds?: string[]
): Promise<FetchReportResult> => {

    const idAndStatusList = await getParcelIdsAndStatus(reportType, fromDate, toDate, parcelIds);

    const rawParcelList = await getRawParcelList(reportType, idAndStatusList, parcelIds);

    if (typeof rawParcelList === "string") {
        const logId = "Failed to fetch parcel IDs and statuses";
        return {
            data: null,
            error: {
                type: "failedToFetchParcelIds",
                logId,
            },
        };
    }
    return convertRawParcelListToReportResult(rawParcelList, idAndStatusList);
};

interface idAndStatus {
    parcel_id: string | null;
    last_status_event_name: string | null;
};

const getParcelIdsAndStatus = async (
    reportType: string,
    fromDate?: Dayjs,
    toDate?: Dayjs,
    parcelIds?: string[]
): Promise<idAndStatus[]> => {
    let query = supabase
    .from("parcels_plus")
    .select("parcel_id, last_status_event_name");
    
    switch (reportType) {
        case "signposting":
            if (!fromDate || !toDate) {
                return [];
            }
            query = query
            .gte("packing_date", getDbDate(fromDate))
            .lte("packing_date", getDbDate(toDate))
            .or('last_status_event_name.neq."Parcel Deleted",last_status_event_name.is.null');
            break;
        case "pendingMoreInfo":
            if (!fromDate || !toDate) {
                return [];
            }
            query = query
            .gte("packing_date", getDbDate(fromDate))
            .lte("packing_date", getDbDate(toDate))
            .or('last_status_event_name.eq."Pending More Info"');
            break;
        case "voucherNumber":
            if (!fromDate || !toDate) {
                return [];
            }
            query = query
            .gte("packing_date", getDbDate(fromDate))
            .lte("packing_date", getDbDate(toDate))
            .or('voucher_number.not.ilike.E%, voucher_number.eq."", voucher_number.is.null')
            .or('last_status_event_name.neq."Parcel Deleted",last_status_event_name.is.null')
            .eq("client_is_active", true);
            break;
        case "selectedParcels":
            if (!parcelIds) {
                return [];
            }
            query = query.in("parcel_id", parcelIds);
            break;
        default:
            break;
    }

    const {data: idAndStatus, error: idFetchError} = await query;
     if (idFetchError) {
        const logId = await logErrorReturnLogId(
            "Failed to fetch parcel IDs and statuses",
            {
                error: idFetchError,
            }
        );
        return [];
    }
    return idAndStatus;
}

interface rawParcel {
    primary_key: string;
    voucher_number: string | null;
    packing_date: string | null;
    created_at: string;
    collection_datetime: string | null;
    collection_centre: {
        name: string;
        is_shown: boolean;
    } | null;
    list_type: "regular" | "hotel";
    client: {
        full_name: string | null;
        is_active: boolean;
        signposting_call_required: boolean | null;
        flagged_for_attention: boolean | null;
        phone_number: string | null;
        signposting_call_reasons: string[] | null;
        delivery_instructions: string | null;
        extra_information: string | null;
        notes: string | null;
        address_1: string | null;
        address_2: string | null;
        address_town: string | null;
        address_county: string | null;
        address_postcode: string | null;
        cooking_facilities: string[] | null;
        dietary_requirements: string[] | null;
        hygiene_tampons: string | null;
        hygiene_pads: string | null;
        hygiene_other_items: string[] | null;
        baby_food: string | null;
        baby_formula: string | null;
        baby_nappies: string | null;
        baby_other_items: string[] | null;
        pet_food: string[] | null;
        other_items: string[] | null;
        family: {
            birth_year: number | null;
            birth_month: number | null;
            gender: "male" | "female" | "other" | null;
            recorded_as_child: boolean | null;
        }[];
    } | null;
};

const getRawParcelList = async (
    reportType: string,
    idAndStatusList: idAndStatus[],
    parcelIds?: string[],
): Promise<rawParcel[] | string> => {
    let query = supabase.from("parcels")
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
        .limit(1, { foreignTable: "clients" });

    switch (reportType) {
        case "signposting":
            query = query
                .in(
                    "primary_key",
                    idAndStatusList.map((idAndStatus) => idAndStatus.parcel_id).filter((id) => id !== null)
                    )
                .eq("client.is_active", true)
                .eq("client.signposting_call_required", true)
                .order("packing_date")
                .order("client_id");
            break;
        case "pendingMoreInfo":
            query = query
                .in(
                    "primary_key",
                    idAndStatusList.map((idAndStatus) => idAndStatus.parcel_id).filter((id) => id !== null)
                    )
                .eq("client.is_active", true)
                .order("packing_date")
                .order("client_id");
            break;
        case "voucherNumber":
            query = query
                .in(
                    "primary_key",
                    idAndStatusList.map((idAndStatus) => idAndStatus.parcel_id).filter((id) => id !== null)
                    )
                .order("packing_date")
                .order("client_id");
            break;
        case "selectedParcels":
            if (!parcelIds) {
                return "error";
            }
            query = query
                .eq("client.is_active", true)
                .in("primary_key", parcelIds)
                .order("packing_date")
                .order("primary_key");
            break;
        default:
            break;
    }
    
    const { data: rawParcel, error: parcelFetchError } = await query;
    if (parcelFetchError) { 
        return "error with supabase";
    }

    return rawParcel;
};

const convertRawParcelListToReportResult = (
    rawParcelList: rawParcel[],
    idAndStatusList: idAndStatus[]
): FetchReportResult => {
    return {
        error: null,
        data: rawParcelList
            .filter((rawParcel) => !!rawParcel.client)
            .map((rawParcel): ReportRow => {
                return {
                    voucherNumber: rawParcel.voucher_number ?? "",
                    packingDate: formatDatetimeAsDate(rawParcel.packing_date),
                    fullName: rawParcel.client?.full_name ?? "(error)",
                    signpostingCallRequired: rawParcel.client?.signposting_call_required ?? false,
                    flaggedForAttention: rawParcel.client?.flagged_for_attention ?? false,
                    phoneNumber: rawParcel.client
                        ? formatNumberAsStringForCsv(rawParcel.client.phone_number)
                        : "",
                    /*
                    email: rawParcel.client.email ?? "" // not sure if this would need to use a formatStringAsEmailForCsv; this should be decommented after VFB-395 is merged
                    */
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
}

interface ButtonProps {
    reportType: string;
    fromDate: Dayjs;
    toDate: Dayjs;
    onFileCreationCompleted: () => void;
    onFileCreationFailed: (error: FetchReportError) => void;
    disabled: boolean;
}

const formatReportType = (actionName: string): string => {
    if (actionName.includes("Signposting")) {
        return "signposting";
    } else if (actionName.includes("Pending")) {
        return "pendingMoreInfo";
    } else if (actionName.includes("Voucher")) {
        return "voucherNumber";
    }
    return "selectedParcels";
}

const formatFileName = (reportType: string): string => {
    if (reportType === "signposting") {
        return "SignpostingReport.csv";
    } else if (reportType === "pendingMoreInfo") {
        return "PendingMoreInfoReport.csv";
    } else if (reportType === "voucherNumber") {
        return "MissingVoucherNumberReport.csv";
    }
    return "SelectedParcelsReport.csv";
}

const ReportCsvButton = ({
    reportType,
    fromDate,
    toDate,
    onFileCreationCompleted,
    onFileCreationFailed,
    disabled,
}: ButtonProps): React.ReactElement => {
    const fetchDataAndFileName = async (): Promise<
        FileGenerationDataFetchResponse<
            ReportRow[],
            FetchReportErrorType
        >
    > => {
        reportType = formatReportType(reportType);
        const { data: requiredData, error } = await getReportData(
            reportType,
            fromDate,
            toDate
        );
        if (error) {
            return { data: null, error };
        }
        return {
            data: { fileData: requiredData, fileName: formatFileName(reportType) },
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

export default ReportCsvButton;;