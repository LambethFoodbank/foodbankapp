import { Schema } from "@/databaseUtils";
import supabase from "@/supabaseClient";
import { logErrorReturnLogId } from "@/logger/logger";
import {
    displayNameForDeletedClient,
    formatAddress,
    formatDateStringAsDate,
} from "@/common/format";

export interface DriverOverviewRowData {
    name: string;
    address: string;
    contact?: string;
    packingDate: string | null;
    instructions?: string;
    clientIsActive: boolean;
    numberOfLabels: number | null;
    collectionCentre: string;
    isDelivery: boolean;
}

export type DriverOverviewTablesData = {
    collections: DriverOverviewCollectionCentreData[];
    deliveries: DriverOverviewRowData[];
};

export type DriverOverviewCollectionCentreData = {
    collectionCentreName: string;
    rowData: DriverOverviewRowData[];
};

type ParcelForDelivery = Schema["parcels"] & {
    client: Schema["clients"];
    collection_centre: Schema["collection_centres"];
    labelCount: number | null;
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

type ParcelsForDeliveryErrorType =
    | "parcelFetchFailed"
    | "noMatchingClient"
    | "noCollectionCentre"
    | "noActiveParcels";

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

export type DriverOverviewErrorType = DriverPdfErrorType | "driverMessageFetchFailed";
export type DriverOverviewError = { type: DriverOverviewErrorType; logId: string };

const getParcelsForDelivery = async (parcelIds: string[]): Promise<ParcelsForDeliveryResponse> => {
    const { data, error } = await supabase
        .from("parcels")
        .select(
            "*, client:clients(*), events(*), collection_centre:collection_centres(*), collection_centres(name), clients(address_postcode)"
        )
        .in("primary_key", parcelIds)
        .limit(1, { foreignTable: "clients" })
        .limit(1, { foreignTable: "collection_centres" })
        .eq("events.new_parcel_status", "Shipping Labels Downloaded")
        .order("collection_centres(name)")
        .order("clients(address_postcode)");

    if (error) {
        const logId = await logErrorReturnLogId("Error with fetch: Parcels", { error });
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

        if (!parcel.client.is_active) {
            continue;
        }

        const sortedParcelEvents = parcel.events.sort((event1, event2) => {
            if (event1.timestamp > event2.timestamp) {
                return 1;
            }
            if (event1.timestamp < event2.timestamp) {
                return -1;
            }
            return 0;
        });
        const mostRecentEventData =
            sortedParcelEvents.length > 0
                ? sortedParcelEvents[sortedParcelEvents.length - 1].event_data
                : null;
        const labelCount =
            mostRecentEventData !== null ? Number.parseInt(mostRecentEventData) : null;

        dataWithNonNullClients.push({
            ...parcel,
            client: parcel.client,
            collection_centre: parcel.collection_centre,
            labelCount: Number.isNaN(labelCount) ? null : labelCount,
        });
    }

    if (dataWithNonNullClients.length === 0) {
        const logId = await logErrorReturnLogId("All selected parcels belong to deleted clients.");
        return { data: null, error: { type: "noActiveParcels", logId: logId } };
    }

    return { data: dataWithNonNullClients, error: null };
};

const transformRowToDriverOverviewTableData = (
    parcel: ParcelForDelivery
): DriverOverviewRowData => {
    const client = parcel.client;
    const clientIsActive = parcel.client.is_active;
    return {
        name: clientIsActive ? client?.full_name ?? "" : displayNameForDeletedClient,
        address: formatAddress(
            client?.address_1,
            client?.address_2,
            client?.address_town,
            client?.address_county,
            client?.address_postcode,
            false
        ),
        contact: clientIsActive ? client?.phone_number ?? "" : "-",
        packingDate: formatDateStringAsDate(parcel.packing_date) ?? null,
        instructions: clientIsActive ? client?.delivery_instructions ?? "" : "-",
        clientIsActive: clientIsActive,
        numberOfLabels: parcel.labelCount,
        collectionCentre: parcel.collection_centre?.name,
        isDelivery: parcel.collection_centre?.is_delivery,
    };
};

const transformParcelDataToTableData = (parcels: ParcelForDelivery[]): DriverOverviewTablesData => {
    const transformedParcels = parcels
        .map((parcel) => transformRowToDriverOverviewTableData(parcel))
        .filter((parcel) => parcel.clientIsActive);

    const collectionCentreNames = Array.from(
        new Set(
            transformedParcels
                .filter((parcel) => !parcel.isDelivery)
                .map((parcel) => parcel.collectionCentre)
        )
    ).sort();

    const collectionCentreData: DriverOverviewCollectionCentreData[] = collectionCentreNames.map(
        (ccName) => {
            return {
                collectionCentreName: ccName,
                rowData: transformedParcels.filter((parcel) => parcel.collectionCentre === ccName),
            };
        }
    );

    return {
        collections: collectionCentreData,
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

export default getDriverPdfData;
