import { Schema } from "@/databaseUtils";
import supabase from "@/supabaseClient";
import { EventTableRow } from "./EventTable";
import { logErrorReturnLogId } from "@/logger/logger";
import {
    formatAddressFromClientDetails,
    formatBreakdownOfAdultsFromFamilyDetails,
    formatBreakdownOfChildrenFromFamilyDetails,
    formatHouseholdFromFamilyDetails,
} from "@/app/clients/getExpandedClientDetails";
import { capitaliseWords, formatDateTime, formatDatetimeAsDate } from "@/common/format";
import {
    Data,
    DataForDataViewer,
    convertDataToDataForDataViewer,
} from "@/components/DataViewer/DataViewer";
import { formatEventName } from "./format";
import { ListType } from "@/common/databaseListTypes";

type FetchExpandedParcelDetailsResult =
    | {
          parcelDetails: ExpandedParcelDetails;
          error: null;
      }
    | {
          parcelDetails: null;
          error: FetchExpandedParcelDetailsError;
      };

export interface FetchExpandedParcelDetailsError {
    type: FetchExpandedParcelDetailsErrorType;
    logId: string;
}

type FetchExpandedParcelDetailsErrorType =
    | "failedToFetchParcelDetails"
    | "clientDetailDoesNotExist";

const getExpandedParcelDetails = async (
    parcelId: string
): Promise<FetchExpandedParcelDetailsResult> => {
    const { data: rawParcelDetails, error } = await supabase
        .from("parcels")
        .select(
            `
        voucher_number,
        packing_date,
        created_at,
        collection_datetime,
        list_type,
        packing_slot: packing_slots (
            name
         ),
        collection_centre:collection_centres (
            name,
            is_shown
         ),
        client:clients(
            primary_key,
            full_name,
            phone_number,
            delivery_instructions,
            address_1,
            address_2,
            address_town,
            address_county,
            address_postcode,
            is_active,

            family:families(
                birth_year,
                birth_month,
                gender,
                recorded_as_child
            )
        ),
        events:events (
            new_parcel_status,
            timestamp,
            event_data
        )
    `
        )
        .eq("primary_key", parcelId)
        .single();

    if (error) {
        const logId = await logErrorReturnLogId("Failed to fetch expanded parcel details", {
            error,
        });
        return {
            parcelDetails: null,
            error: {
                type: "failedToFetchParcelDetails",
                logId,
            },
        };
    }

    const client = rawParcelDetails.client;

    if (client === null) {
        const logId = await logErrorReturnLogId(
            "Failed to fetch client details when fetching expanded parcel details",
            { dbParcelDetails: rawParcelDetails }
        );

        return {
            parcelDetails: null,
            error: {
                type: "clientDetailDoesNotExist",
                logId,
            },
        };
    }

    const clientIsActive = client.is_active;

    if (clientIsActive) {
        return {
            parcelDetails: {
                expandedParcelData: {
                    isActive: true,
                    voucherNumber: rawParcelDetails.voucher_number ?? "",
                    fullName: client.full_name ?? "",
                    listType: rawParcelDetails.list_type,
                    address: formatAddressFromClientDetails(client),
                    deliveryInstructions: client.delivery_instructions ?? "",
                    phoneNumber: client.phone_number ?? "",
                    household: formatHouseholdFromFamilyDetails(client.family),
                    adults: formatBreakdownOfAdultsFromFamilyDetails(client.family),
                    children: formatBreakdownOfChildrenFromFamilyDetails(client.family),
                    packingDate: formatDatetimeAsDate(rawParcelDetails.packing_date),
                    packingSlot: rawParcelDetails.packing_slot?.name ?? "",
                    method: rawParcelDetails.collection_centre?.is_shown
                        ? rawParcelDetails.collection_centre?.name
                        : `${rawParcelDetails.collection_centre?.name} (inactive)`,
                    collectionDateTime: formatDateTime(rawParcelDetails.collection_datetime),
                    createdAt: formatDateTime(rawParcelDetails.created_at),
                },
                events: processEventsDetails(rawParcelDetails.events),
            },
            error: null,
        };
    }
    return {
        parcelDetails: {
            expandedParcelData: {
                isActive: false,
                voucherNumber: rawParcelDetails.voucher_number ?? "",
                listType: rawParcelDetails.list_type,
                packingDate: formatDatetimeAsDate(rawParcelDetails.packing_date),
                packingSlot: rawParcelDetails.packing_slot?.name ?? "",
                method: rawParcelDetails.collection_centre?.is_shown
                    ? rawParcelDetails.collection_centre?.name
                    : `${rawParcelDetails.collection_centre?.name} (inactive)`,
                collectionDateTime: formatDateTime(rawParcelDetails.collection_datetime),
                createdAt: formatDateTime(rawParcelDetails.created_at),
            },
            events: processEventsDetails(rawParcelDetails.events),
        },
        error: null,
    };
};

interface ParcelDataIndependentOfClient extends Data {
    voucherNumber: string;
    packingDate: string;
    packingSlot: string;
    method: string;
    collectionDateTime: string;
    createdAt: string;
    listType: ListType;
}

interface ParcelDataForInactiveClient extends ParcelDataIndependentOfClient {
    isActive: false;
}

interface ParcelDataForActiveClient extends ParcelDataIndependentOfClient {
    isActive: true;
    fullName: string;
    address: string;
    deliveryInstructions: string;
    phoneNumber: string;
    household: string;
    adults: string;
    children: string;
}

type ExpandedParcelData = ParcelDataForActiveClient | ParcelDataForInactiveClient;

export interface ExpandedParcelDetails {
    expandedParcelData: ExpandedParcelData;
    events: EventTableRow[];
}

export const formatDatetimeAsTime = (datetime: string | null): string => {
    if (datetime === null || isNaN(Date.parse(datetime))) {
        return "-";
    }

    return new Date(datetime).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
};

export const processEventsDetails = (
    events: Pick<Schema["events"], "event_data" | "new_parcel_status" | "timestamp">[]
): EventTableRow[] => {
    return events.map((event) => ({
        eventInfo: formatEventName(event.new_parcel_status, event.event_data),
        timestamp: new Date(event.timestamp),
    }));
};

export default getExpandedParcelDetails;

export const getExpandedParcelDataForDataViewer = (
    parcelDetails: ExpandedParcelData
): DataForDataViewer => {
    const parcelDetailsForDataViewer = convertDataToDataForDataViewer({
        ...parcelDetails,
    });
    parcelDetailsForDataViewer["isActive"] = {
        value: parcelDetails["isActive"],
        hide: true,
    };
    parcelDetailsForDataViewer["listType"] = {
        value: capitaliseWords(parcelDetails["listType"]),
    };
    return parcelDetailsForDataViewer;
};
