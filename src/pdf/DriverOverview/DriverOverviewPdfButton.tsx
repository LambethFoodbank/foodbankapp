"use client";

import React from "react";
import supabase from "@/supabaseClient";
import { Schema } from "@/databaseUtils";
import PdfButton from "@/components/PdfButton/PdfButton";
import DriverOverviewPdf, {
    DriverOverviewTablesData,
    DriverOverviewRowData,
} from "@/pdf/DriverOverview/DriverOverviewPdf";
import { logErrorReturnLogId } from "@/logger/logger";
import { displayNameForDeletedClient, formatDateToDate } from "@/common/format";
import { Dayjs } from "dayjs";
import { ParcelsTableRow } from "@/app/parcels/parcelsTable/types";
import { PdfDataFetchResponse } from "../common";

interface DriverOverviewData {
    driverName: string | null;
    date: Date;
    tableData: DriverOverviewTablesData;
    message: string;
}

type ParcelForDelivery = Schema["parcels"] & {
    client: Schema["clients"];
    collection_centre: Schema["collection_centres"];
    labelCount: number;
};

type ParcelsForDeliveryResponse =
    | {
          data: ParcelForDelivery[];
          error: null;
      }
    | {
          data: null;
          error: { type: ParcelsForDeliveryErrorType; logId: string };
      };

type ParcelsForDeliveryErrorType = "parcelFetchFailed" | "noMatchingClient" | "noCollectionCentre";

const getParcelsForDelivery = async (parcelIds: string[]): Promise<ParcelsForDeliveryResponse> => {
    const { data, error } = await supabase
        .from("parcels")
        .select(
            "*, client:clients(*), events(event_data), collection_centre:collection_centres(*), collection_centres(name), clients(address_postcode)"
        )
        .in("primary_key", parcelIds)
        .limit(1, { foreignTable: "clients" })
        .limit(1, { foreignTable: "collection_centres" })
        .eq("events.new_parcel_status", "Shipping Labels Downloaded")
        .order("collection_centres(name)")
        .order("clients(address_postcode)");

    if (error) {
        const logId = await logErrorReturnLogId("Error with fetch: Parcels", error);
        return { data: null, error: { type: "parcelFetchFailed", logId: logId } };
    }

    const dataWithNonNullClients: ParcelForDelivery[] = [];
    for (const parcel of data) {
        if (parcel.client === null) {
            const logId = await logErrorReturnLogId(
                "Error with fetch: Parcels. No matching client found"
            );
            return { data: null, error: { type: "noMatchingClient", logId: logId } };
        }

        if (parcel.collection_centre === null) {
            const logId = await logErrorReturnLogId(
                "Error with fetch: Parcels. No collection centre found"
            );
            return { data: null, error: { type: "noCollectionCentre", logId: logId } };
        }

        let labelCount = 0;
        if (parcel.events && parcel.events.length > 0 && parcel.events[0].event_data) {
            labelCount = Number.parseInt(parcel.events[0].event_data);
        }

        dataWithNonNullClients.push({
            ...parcel,
            client: parcel.client,
            collection_centre: parcel.collection_centre,
            labelCount: labelCount,
        });
    }

    return { data: dataWithNonNullClients, error: null };
};

type DriverPdfResponse =
    | {
          data: DriverOverviewTablesData;
          error: null;
      }
    | {
          data: null;
          error: { type: DriverPdfErrorType; logId: string };
      };

type DriverPdfErrorType = ParcelsForDeliveryErrorType;

const transformRowToDriverOverviewTableData = (
    parcel: ParcelForDelivery
): DriverOverviewRowData => {
    const client = parcel.client;
    const clientIsActive = parcel.client.is_active;
    return {
        name: clientIsActive ? client?.full_name ?? "" : displayNameForDeletedClient,
        address: {
            line1: client?.address_1 ?? "",
            line2: client?.address_2 ?? null,
            town: client?.address_town ?? null,
            county: client?.address_county ?? null,
            postcode: client?.address_postcode,
        },
        contact: clientIsActive ? client?.phone_number ?? "" : "-",
        packingDate: formatDateToDate(parcel.packing_date) ?? null,
        instructions: clientIsActive ? client?.delivery_instructions ?? "" : "-",
        clientIsActive: clientIsActive,
        numberOfLabels: parcel.labelCount,
        collectionCentre: parcel.collection_centre?.name,
        isDelivery: parcel.collection_centre?.is_delivery,
    };
};

const transformParcelDataToTableData = (parcels: ParcelForDelivery[]): DriverOverviewTablesData => {
    const transformedParcels = parcels.map((parcel) =>
        transformRowToDriverOverviewTableData(parcel)
    );

    return {
        collections: transformedParcels.filter((parcel) => !parcel.isDelivery),
        deliveries: transformedParcels.filter((parcel) => parcel.isDelivery),
    };
};

const getDriverPdfData = async (parcelIds: string[]): Promise<DriverPdfResponse> => {
    const { data: parcels, error: parcelsError } = await getParcelsForDelivery(parcelIds);
    if (parcelsError) {
        return { data: null, error: parcelsError };
    }
    const tableData = transformParcelDataToTableData(parcels);
    return { data: tableData, error: null };
};

interface Props {
    parcels: ParcelsTableRow[];
    driverName: string | null;
    date: Dayjs;
    onPdfCreationCompleted: () => void;
    onPdfCreationFailed: (error: DriverOverviewError) => void;
    disabled: boolean;
}

export type DriverOverviewErrorType = DriverPdfErrorType | "driverMessageFetchFailed";
export type DriverOverviewError = { type: DriverOverviewErrorType; logId: string };

const DriverOverviewPdfButton = ({
    parcels,
    driverName,
    date,
    onPdfCreationCompleted,
    onPdfCreationFailed,
    disabled,
}: Props): React.ReactElement => {
    const fetchDataAndFileName = async (): Promise<
        PdfDataFetchResponse<DriverOverviewData, DriverOverviewErrorType>
    > => {
        const parcelIds = parcels.map((parcel) => {
            return parcel.parcelId;
        });
        const { data: driverPdfData, error: driverPdfError } = await getDriverPdfData(parcelIds);
        if (driverPdfError) {
            return { data: null, error: driverPdfError };
        }
        const { data: driverMessageData, error: driverMessageError } = await supabase
            .from("website_data")
            .select("name, value")
            .eq("name", "driver_overview_message")
            .single();
        if (driverMessageError) {
            const logId = await logErrorReturnLogId("Error with fetch: Driver overview message", {
                error: driverMessageError,
            });
            return { data: null, error: { type: "driverMessageFetchFailed", logId: logId } };
        }
        return {
            data: {
                pdfData: {
                    driverName: driverName,
                    date: date.toDate(),
                    tableData: driverPdfData,
                    message: driverMessageData.value,
                },
                fileName: "DriverOverview.pdf",
            },
            error: null,
        };
    };
    return (
        <PdfButton
            fetchDataAndFileName={fetchDataAndFileName}
            pdfComponent={DriverOverviewPdf}
            onPdfCreationCompleted={onPdfCreationCompleted}
            onPdfCreationFailed={onPdfCreationFailed}
            disabled={disabled}
        />
    );
};

export default DriverOverviewPdfButton;
