"use client";

import React from "react";
import supabase from "@/supabaseClient";
import { ViewSchema } from "@/databaseUtils";
import PdfButton from "@/components/FileGenerationButtons/PdfButton";
import DayOverviewPdf from "@/pdf/DayOverview/DayOverviewPdf";
import { logErrorReturnLogId } from "@/logger/logger";
import { FileGenerationDataFetchResponse } from "@/components/FileGenerationButtons/common";
import { displayNameForDeletedClient } from "@/common/format";
import { ParcelsTableRow } from "@/app/parcels/parcelsTable/types";
import { CongestionChargeError, checkForCongestionCharge } from "@/common/congestionCharges";

interface Props {
    onPdfCreationCompleted: () => void;
    onPdfCreationFailed: (error: DayOverviewPdfError) => void;
    parcels: ParcelsTableRow[];
}

export type ParcelForDayOverview = Pick<
    ViewSchema["parcels_plus"],
    | "parcel_id"
    | "packing_slot_name"
    | "is_delivery"
    | "collection_centre_acronym"
    | "client_flagged_for_attention"
    | "client_full_name"
    | "client_address_postcode"
    | "client_delivery_instructions"
    | "client_is_active"
> & {
    congestionChargeApplies?: boolean;
};

type ParcelForDayOverviewResponse =
    | {
          data: ParcelForDayOverview[];
          error: null;
      }
    | {
          data: null;
          error: { type: ParcelForDayOverviewErrorType | CongestionChargeError; logId: string };
      };

type ParcelForDayOverviewErrorType = "parcelFetchFailed";

const getParcelsForDayOverview = async (
    parcelIds: string[]
): Promise<ParcelForDayOverviewResponse> => {
    const { data, error } = await supabase
        .from("parcels_plus")
        .select(
            `
            parcel_id,
            packing_slot_name,
            is_delivery,
            collection_centre_acronym,
            client_flagged_for_attention,
            client_full_name,
            client_address_postcode,
            client_delivery_instructions,
            client_is_active
            `
        )
        .in("parcel_id", parcelIds)
        .order("packing_date")
        .order("packing_slot_order")
        .order("is_delivery", { ascending: false })
        .order("collection_centre_acronym")
        .order("client_address_postcode")
        .order("parcel_id");

    if (error) {
        const logId = await logErrorReturnLogId("Error with fetch: Parcel", error);
        return { data: null, error: { type: "parcelFetchFailed", logId: logId } };
    }

    const processedData = data.map((parcel) => {
        if (parcel.client_is_active) {
            return parcel;
        }
        return {
            ...parcel,
            client_flagged_for_attention: false,
            client_full_name: displayNameForDeletedClient,
            client_address_postcode: "-",
            client_delivery_instructions: "-",
        };
    });

    return { data: processedData, error: null };
};
export interface DayOverviewPdfData {
    parcels: ParcelForDayOverview[];
}

type DayOverviewPdfErrorType = ParcelForDayOverviewErrorType | CongestionChargeError;
export type DayOverviewPdfError = { type: DayOverviewPdfErrorType; logId: string };

const addCongestionChargeDetailsForDayOverview = async (
    parcels: ParcelForDayOverview[]
): Promise<ParcelForDayOverviewResponse> => {
    const postcodes = parcels.map((parcel) => parcel.client_address_postcode);

    const { data: postcodesWithCongestionChargeDetails, error } =
        await checkForCongestionCharge(postcodes);

    if (error) {
        return { data: null, error: error };
    }

    parcels.map((parcel, index) => {
        parcel.congestionChargeApplies =
            postcodesWithCongestionChargeDetails[index].congestionCharge;
    });

    return { data: parcels, error: null };
};

const DayOverviewPdfButton = ({
    onPdfCreationCompleted,
    onPdfCreationFailed,
    parcels,
}: Props): React.ReactElement => {
    const fetchDataAndFileName = async (): Promise<
        FileGenerationDataFetchResponse<DayOverviewPdfData, DayOverviewPdfErrorType>
    > => {
        const parcelIds = parcels.map((parcel) => {
            return parcel.parcelId;
        });
        const { data: parcelsForDayOverview, error: error } =
            await getParcelsForDayOverview(parcelIds);
        if (error) {
            return { data: null, error: error };
        }

        const {
            data: parcelsForDayOverviewWithCongestionChargeDetails,
            error: congestionChargeError,
        } = await addCongestionChargeDetailsForDayOverview(parcelsForDayOverview);

        if (congestionChargeError) {
            return { data: null, error: congestionChargeError };
        }

        const fileName = "DayOverview.pdf";
        return {
            data: {
                fileData: {
                    parcels: parcelsForDayOverviewWithCongestionChargeDetails,
                },
                fileName: fileName,
            },
            error: null,
        };
    };

    return (
        <PdfButton
            fetchDataAndFileName={fetchDataAndFileName}
            pdfComponent={DayOverviewPdf}
            onFileCreationCompleted={onPdfCreationCompleted}
            onFileCreationFailed={onPdfCreationFailed}
            focusOnButton={true}
        />
    );
};

export default DayOverviewPdfButton;
