"use client";

import React from "react";
import supabase from "@/supabaseClient";
import { Schema } from "@/databaseUtils";
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
    Schema["parcels"],
    "collection_datetime" | "primary_key"
> & {
    client: Pick<
        Schema["clients"],
        "flagged_for_attention" | "full_name" | "address_postcode" | "delivery_instructions"
    > | null;
    collection_centre: Pick<Schema["collection_centres"], "name"> | null;
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
        .from("parcels")
        .select(
            `collection_datetime, primary_key,
            collection_centre:collection_centres(name),
            client:clients ( 
                flagged_for_attention, 
                full_name, 
                address_postcode, 
                delivery_instructions,
                is_active
            )`
        )
        .in("primary_key", parcelIds)
        .order("collection_datetime");

    if (error) {
        const logId = await logErrorReturnLogId("Error with fetch: Parcel", error);
        return { data: null, error: { type: "parcelFetchFailed", logId: logId } };
    }

    const processedData = data.map((parcel) => {
        if (parcel.client?.is_active) {
            return parcel;
        }
        return {
            ...parcel,
            client: {
                flagged_for_attention: false,
                full_name: displayNameForDeletedClient,
                address_postcode: "-",
                delivery_instructions: "-",
            },
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
    const postcodes = parcels.map((parcel) => parcel.client?.address_postcode);

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
