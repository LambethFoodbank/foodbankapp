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
import { displayNameForDeletedClient, formatDatetimeAsDate } from "@/common/format";
import { FileGenerationDataFetchResponse } from "@/components/FileGenerationButtons/common";
import CsvButton, {
    formatNumberAsStringForCsv,
} from "@/components/FileGenerationButtons/CsvButton";
import { signpostingCallOptions } from "@/app/clients/form/formSections/SignpostingCallCard";
import { ParcelsTableRow } from "../../parcelsTable/types";

export type FetchReportResult =
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

export type FetchReportErrorType =
    | "failedToFetchRows"
    | "noRowsForInterval"
    | "failedToFetchParcelIds";

export type ReportRow = {
    voucherNumber: string;
    packingDate: string;
    fullName: string;
    signpostingCallRequired: boolean;
    flaggedForAttention: boolean;
    phoneNumber: string;
    email: string;
    signpostingCallReasons: string;
    address: string;
    parcelStatus: string;
    deliveryOrCollection: string;
    deliveryCollectionDate: string;
    deliveryInstructions: string;
    extraInformation: string;
    parcelNotes: string;
    clientNotes: string;
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
    referralAgency: string | null;
    referrerEmail: string | null;
    referrerName: string | null;
    referrerPhone: string | null;
};

export interface idAndStatus {
    parcel_id: string | null;
    last_status_event_name: string | null;
}

export interface rawParcel {
    primary_key: string;
    voucher_number: string | null;
    packing_date: string | null;
    created_at: string;
    collection_datetime: string | null;
    notes: string | null;
    referral_agency: string | null;
    referrer_email: string | null;
    referrer_name: string | null;
    referrer_phone: string | null;
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
        email: string | null;
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
}

export const getRawParcelListQuery = `
        primary_key,
        voucher_number,
        packing_date,
        created_at,
        collection_datetime,
        notes,
        referral_agency,
        referrer_email,
        referrer_name,
        referrer_phone,
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
            email,
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
    `;

// After moving columns from clients to parcels, we need to ensure that the report rows are created correctly
const createReportRow = (
    rawParcel: rawParcel,
    idAndStatusList: idAndStatus[],
    isActive: boolean
): ReportRow => {
    const baseRow = {
        clientIsActive: isActive,
        voucherNumber: rawParcel.voucher_number ?? "",
        packingDate: formatDatetimeAsDate(rawParcel.packing_date),
        referralAgency: rawParcel.referral_agency ?? "",
        referrerName: rawParcel.referrer_name ?? "",
        referrerPhone: rawParcel.referrer_phone ?? "",
        referrerEmail: rawParcel.referrer_email ?? "",
        parcelStatus:
            idAndStatusList.find((idAndStatus) => idAndStatus.parcel_id === rawParcel.primary_key)
                ?.last_status_event_name ?? "(none)",
        deliveryOrCollection: rawParcel.collection_centre?.is_shown
            ? rawParcel.collection_centre?.name
            : `${rawParcel.collection_centre?.name} (inactive)`,
        deliveryCollectionDate: formatDatetimeAsDate(rawParcel.collection_datetime),
        parcelNotes: rawParcel.notes ?? "",
        parcelListType: rawParcel.list_type,
        recordCreatedOn: formatDatetimeAsDate(rawParcel.created_at),
    };

    if (isActive && rawParcel.client) {
        return {
            ...baseRow,
            fullName: rawParcel.client.full_name ?? "(error)",
            signpostingCallRequired: rawParcel.client.signposting_call_required ?? false,
            flaggedForAttention: rawParcel.client.flagged_for_attention ?? false,
            phoneNumber: formatNumberAsStringForCsv(rawParcel.client.phone_number),
            email: rawParcel.client.email ?? "",
            signpostingCallReasons: formatRequirementsByCanonicalOrder(
                rawParcel.client.signposting_call_reasons ?? null,
                signpostingCallOptions
            ),
            address: formatAddressFromClientDetails(rawParcel.client),
            deliveryInstructions: rawParcel.client.delivery_instructions ?? "",
            extraInformation: rawParcel.client.extra_information ?? "",
            clientNotes: rawParcel.client.notes ?? "",
            cookingFacilities: formatRequirementsByCanonicalOrder(
                rawParcel.client.cooking_facilities ?? null,
                cookingFacilitiesOptions
            ),
            dietaryRequirements: formatRequirementsByCanonicalOrder(
                rawParcel.client.dietary_requirements ?? null,
                dietaryRequirementOptions
            ),
            hygieneProducts: formatHygieneProducts(
                rawParcel.client.hygiene_tampons ?? null,
                rawParcel.client.hygiene_pads ?? null,
                rawParcel.client.hygiene_other_items ?? []
            ),
            babyProducts: formatBabyProducts(
                rawParcel.client.baby_food ?? null,
                rawParcel.client.baby_formula ?? null,
                rawParcel.client.baby_nappies ?? null,
                rawParcel.client.baby_other_items ?? []
            ),
            petFood: formatRequirementsByCanonicalOrder(
                rawParcel.client.pet_food ?? null,
                petFoodOptions
            ),
            otherItems: formatRequirementsByCanonicalOrder(
                rawParcel.client.other_items ?? null,
                otherRequirementOptions
            ),
            household: formatHouseholdFromFamilyDetails(rawParcel.client.family),
            adults: formatBreakdownOfAdultsFromFamilyDetails(rawParcel.client.family),
            children: formatBreakdownOfChildrenFromFamilyDetails(rawParcel.client.family),
        };
    } else {
        return {
            ...baseRow,
            fullName: displayNameForDeletedClient,
            signpostingCallRequired: false,
            flaggedForAttention: false,
            phoneNumber: "",
            email: "",
            signpostingCallReasons: "",
            address: "",
            deliveryInstructions: "",
            extraInformation: "",
            clientNotes: "",
            cookingFacilities: "",
            dietaryRequirements: "",
            hygieneProducts: "",
            babyProducts: "",
            petFood: "",
            otherItems: "",
            household: "",
            adults: "",
            children: "",
        };
    }
};

export const convertRawParcelListToReportResult = (
    rawParcelList: rawParcel[],
    idAndStatusList: idAndStatus[]
): FetchReportResult => {
    return {
        error: null,
        data: rawParcelList.map((rawParcel): ReportRow => {
            const isActive = !!rawParcel.client?.is_active;
            return createReportRow(rawParcel, idAndStatusList, isActive);
        }),
    };
};

export interface ButtonProps {
    onFileCreationCompleted: () => void;
    onFileCreationFailed: (error: FetchReportError) => void;
    disabled?: boolean;
    fileName?: string;
    reportType: "parcelList" | "dateInterval";
    getReportDataByDate?: (fromDate: Dayjs, toDate: Dayjs) => Promise<FetchReportResult>;
    fromDate: Dayjs | null;
    toDate: Dayjs | null;
    getReportDataByList?: (parcels: string[]) => Promise<FetchReportResult>;
    parcels: ParcelsTableRow[];
}

const ReportCsvButton = ({
    onFileCreationCompleted,
    onFileCreationFailed,
    disabled,
    fileName = "Report.csv",
    reportType,
    fromDate,
    toDate,
    parcels,
    getReportDataByDate,
    getReportDataByList,
}: ButtonProps): React.ReactElement => {
    const fetchDataAndFileName = async (): Promise<
        FileGenerationDataFetchResponse<ReportRow[], FetchReportErrorType>
    > => {
        if (reportType === "dateInterval" && fromDate && toDate && getReportDataByDate) {
            const { data: requiredData, error } = await getReportDataByDate(fromDate, toDate);
            if (error) {
                return { data: null, error };
            }
            return {
                data: { fileData: requiredData, fileName: fileName },
                error: null,
            };
        } else if (
            reportType === "parcelList" &&
            parcels &&
            parcels.length > 0 &&
            getReportDataByList
        ) {
            const parcelIds = parcels.map((parcel) => {
                return parcel.parcelId;
            });
            const { data: requiredData, error } = await getReportDataByList(parcelIds);
            if (error) {
                return { data: null, error };
            }
            return {
                data: { fileData: requiredData, fileName: fileName },
                error: null,
            };
        } else {
            return {
                data: null,
                error: {
                    type: "failedToFetchParcelIds",
                    logId: "No selected Rows",
                },
            };
        }
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

export default ReportCsvButton;
