"use client";

import React from "react";
import supabase from "@/supabaseClient";
import { logErrorReturnLogId } from "@/logger/logger";
import { FileGenerationDataFetchResponse } from "@/components/FileGenerationButtons/common";
import { formatDatetimeAsDate } from "@/common/format";
import { ParcelsTableRow } from "@/app/parcels/parcelsTable/types";
import CsvButton, {
    formatNumberAsStringForCsv,
} from "@/components/FileGenerationButtons/CsvButton";
import {
    formatAddressFromClientDetails,
    formatBabyProducts,
    formatBreakdownOfAdultsFromFamilyDetails,
    formatBreakdownOfChildrenFromFamilyDetails,
    formatHouseholdFromFamilyDetails,
    formatHygieneProducts,
    formatRequirementsByCanonicalOrder,
} from "@/app/clients/getExpandedClientDetails";
import { signpostingCallOptions } from "@/app/clients/form/formSections/SignpostingCallCard";
import { cookingFacilitiesOptions } from "@/app/clients/form/formSections/CookingFacilitiesCard";
import { dietaryRequirementOptions } from "@/app/clients/form/formSections/DietaryRequirementCard";
import { petFoodOptions } from "@/app/clients/form/formSections/PetFoodCard";
import { otherRequirementOptions } from "@/app/clients/form/formSections/OtherItemsCard";

type FetchSelectedParcelsReportResult =
    | {
          data: SelectedParcelsReportRow[];
          error: null;
      }
    | {
          data: null;
          error: FetchSelectedParcelsReportError;
      };

export interface FetchSelectedParcelsReportError {
    type: FetchSelectedParcelsReportErrorType;
    logId: string;
}

type FetchSelectedParcelsReportErrorType =
    | "failedToFetchSelectedParcelsRows"
    | "failedToFetchSelectedParcelsIds";

type SelectedParcelsReportRow = {
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

const getParcelsForSelectedParcelsReport = async (
    parcelIds: string[]
): Promise<FetchSelectedParcelsReportResult> => {
    const { data: idAndStatusList, error: idFetchError } = await supabase
        .from("parcels_plus")
        .select("parcel_id, last_status_event_name")
        .in("parcel_id", parcelIds);

    if (idFetchError) {
        const logId = await logErrorReturnLogId(
            "Failed to fetch signposting parcel IDs and statuses",
            {
                error: idFetchError,
            }
        );
        return {
            data: null,
            error: {
                type: "failedToFetchSelectedParcelsIds",
                logId,
            },
        };
    }

    const { data, error } = await supabase
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
        .eq("client.is_active", true)
        .in("primary_key", parcelIds)
        .order("packing_date")
        .order("primary_key");

    if (error) {
        const logId = await logErrorReturnLogId("Error with fetch: Parcel", error);
        return { data: null, error: { type: "failedToFetchSelectedParcelsRows", logId: logId } };
    }

    return {
        error: null,
        data: data
            .filter((rawParcel) => !!rawParcel.client)
            .map((rawParcel): SelectedParcelsReportRow => {
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
    onFileCreationCompleted: () => void;
    onFileCreationFailed: (error: FetchSelectedParcelsReportError) => void;
    parcels: ParcelsTableRow[];
}

const SelectedParcelsReportCsvButton = ({
    onFileCreationCompleted,
    onFileCreationFailed,
    parcels,
}: ButtonProps): React.ReactElement => {
    const fetchDataAndFileName = async (): Promise<
        FileGenerationDataFetchResponse<
            SelectedParcelsReportRow[],
            FetchSelectedParcelsReportErrorType
        >
    > => {
        const parcelIds = parcels.map((parcel) => {
            return parcel.parcelId;
        });
        const { data: parcelsForSelectedParcelsReport, error: error } =
            await getParcelsForSelectedParcelsReport(parcelIds);
        if (error) {
            return { data: null, error: error };
        }

        return {
            data: {
                fileData: parcelsForSelectedParcelsReport,
                fileName: "SelectedParcelsReport.csv",
            },
            error: null,
        };
    };

    return (
        <CsvButton
            fetchDataAndFileName={fetchDataAndFileName}
            csvConfig={{ useKeysAsHeaders: true, quoteStrings: true }}
            onFileCreationCompleted={onFileCreationCompleted}
            onFileCreationFailed={onFileCreationFailed}
            focusOnButton={true}
        />
    );
};

export default SelectedParcelsReportCsvButton;
