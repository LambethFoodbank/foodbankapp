"use client";

import React from "react";
import supabase from "@/supabaseClient";
import PdfButton from "@/components/FileGenerationButtons/PdfButton";
import ShippingLabelsPdf, { ShippingLabelData } from "@/pdf/ShippingLabels/ShippingLabelsPdf";
import { ParcelsTableRow } from "@/app/parcels/parcelsTable/types";
import { FileGenerationDataFetchResponse } from "@/components/FileGenerationButtons/common";
import { Schema } from "@/databaseUtils";
import { logErrorReturnLogId } from "@/logger/logger";
import { displayNameForDeletedClient } from "@/common/format";

const formatDatetime = (datetimeString: string | null): string => {
    if (datetimeString === null) {
        return "No recorded date";
    }

    const dateOptions: Intl.DateTimeFormatOptions = {
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    };

    return new Date(datetimeString).toLocaleString([], dateOptions);
};

type ShippingLabelResponse =
    | {
          data: ShippingLabelData[];
          error: null;
      }
    | {
          data: null;
          error: ShippingLabelError;
      };

type ShippingLabelErrorType = ParcelToShipErrorType;

export interface ShippingLabelError {
    type: ShippingLabelErrorType;
    logId: string;
}

type ParcelToShip = Schema["parcels"] & {
    client: Schema["clients"];
    packing_slot: Schema["packing_slots"];
    collection_centre: Schema["collection_centres"];
};

type ParcelToShipResponse =
    | {
          data: ParcelToShip;
          error: null;
      }
    | {
          data: null;
          error: { type: ParcelToShipErrorType; logId: string };
      };

type ParcelToShipErrorType =
    | "parcelFetchFailed"
    | "noMatchingClient"
    | "noMatchingPackingSlot"
    | "noMatchingCollectionCentre";

const getParcelToShip = async (parcelId: string): Promise<ParcelToShipResponse> => {
    const { data, error } = await supabase
        .from("parcels")
        .select(
            "*, client:clients(*), packing_slot:packing_slots(*), collection_centre:collection_centres(*)"
        )
        .eq("primary_key", parcelId)
        .limit(1)
        .limit(1, { foreignTable: "clients" })
        .limit(1, { foreignTable: "collection_centres" })
        .limit(1, { foreignTable: "packing_slot" })
        .single();

    if (error) {
        const logId = await logErrorReturnLogId("Error with fetch: Parcels", error);
        return { data: null, error: { type: "parcelFetchFailed", logId: logId } };
    }

    if (data.client === null) {
        const logId = await logErrorReturnLogId(
            "Error with fetch: Parcels. No matching client found."
        );
        return { data: null, error: { type: "noMatchingClient", logId: logId } };
    }

    if (data.packing_slot === null) {
        const logId = await logErrorReturnLogId(
            "Error with fetch: Parcels. No matching packing slot found."
        );
        return { data: null, error: { type: "noMatchingPackingSlot", logId: logId } };
    }

    if (data.collection_centre === null) {
        const logId = await logErrorReturnLogId(
            "Error with fetch: Parcels. No matching collection centre found."
        );
        return { data: null, error: { type: "noMatchingCollectionCentre", logId: logId } };
    }

    const parcelWithNonNullForeignFields: ParcelToShip = {
        ...data,
        client: data.client,
        packing_slot: data.packing_slot,
        collection_centre: data.collection_centre,
    };
    return { data: parcelWithNonNullForeignFields, error: null };
};

const getRequiredData = async (
    parcelIds: string[],
    labelQuantity: number
): Promise<ShippingLabelResponse> => {
    const parcelDataList: ShippingLabelData[] = [];
    for (const parcelId of parcelIds) {
        const { data: parcel, error: error } = await getParcelToShip(parcelId);
        if (error) {
            return { data: null, error };
        }
        const client = parcel.client;
        const clientIsActive = parcel.client.is_active;
        parcelDataList.push({
            label_quantity: labelQuantity,
            parcel_id: parcelId,
            packing_date: parcel.packing_date ?? "",
            packing_slot: parcel.packing_slot?.name ?? "",
            collection_centre: parcel.collection_centre?.acronym ?? "",
            collection_datetime: formatDatetime(parcel.collection_datetime),
            voucher_number: parcel.voucher_number ?? "",
            full_name: clientIsActive ? client.full_name ?? "" : displayNameForDeletedClient,
            phone_number: clientIsActive ? client.phone_number ?? "" : "-",
            address_1: clientIsActive ? client.address_1 ?? "" : "", //Seeded deleted clients have is_active set to false, but their personal info fields are non-null
            address_2: clientIsActive ? client.address_2 ?? "" : "",
            address_town: clientIsActive ? client.address_town ?? "" : "",
            address_county: clientIsActive ? client.address_county ?? "" : "",
            address_postcode: clientIsActive ? client.address_postcode : "-",
            delivery_instructions: clientIsActive ? client.delivery_instructions ?? "" : "-",
        });
    }
    return { data: parcelDataList, error: null };
};

interface Props {
    parcels: ParcelsTableRow[];
    labelQuantity: number;
    onPdfCreationCompleted: () => void;
    disabled: boolean;
    onPdfCreationFailed: (error: ShippingLabelError) => void;
}

const ShippingLabelsPdfButton = ({
    parcels,
    labelQuantity,
    onPdfCreationCompleted,
    disabled,
    onPdfCreationFailed,
}: Props): React.ReactElement => {
    const fetchDataAndFileName = async (): Promise<
        FileGenerationDataFetchResponse<ShippingLabelData[], ShippingLabelErrorType>
    > => {
        const parcelIds = parcels.map((parcel) => parcel.parcelId);
        const { data: requiredData, error } = await getRequiredData(parcelIds, labelQuantity);
        if (error) {
            return { data: null, error };
        }
        return { data: { fileData: requiredData, fileName: "ShippingLabels.pdf" }, error: null };
    };

    return (
        <PdfButton
            fetchDataAndFileName={fetchDataAndFileName}
            pdfComponent={ShippingLabelsPdf}
            onFileCreationCompleted={onPdfCreationCompleted}
            disabled={disabled}
            onFileCreationFailed={onPdfCreationFailed}
            formSubmitButton={true}
        />
    );
};

export default ShippingLabelsPdfButton;
