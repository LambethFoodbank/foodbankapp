import supabase from "@/supabaseClient";
import { Data } from "@/components/DataViewer/DataViewer";
import { logErrorReturnLogId } from "@/logger/logger";
import { ExpandedClientParcelDetails, getClientParcelsDetails } from "./getClientParcelsData";
import { isAfter, isBefore, sub } from "date-fns";

export interface ExpandedClientParcelStats extends Data {
    totalParcels: number;
    totalSuccessful: number;
    lastSixMonthsSuccessful: number;
}

interface ParcelStatsInfo extends Data {
    last_event_timestamp: string | null;
    last_event_is_successfully_completed: boolean | null;
}

interface ClientParcelStatsError {
    errorMessage: string;
    logId: string;
}

const getParcelIdList = async (clientId: string): Promise<string[]> => {
    const parcelsData: ExpandedClientParcelDetails[] = await getClientParcelsDetails(clientId);
    return parcelsData.map((clientDetails) => clientDetails.parcelId);
};

const getAllClientParcelsStats = async (
    parcelIdList: string[]
): Promise<{ data: ParcelStatsInfo[]; error: ClientParcelStatsError | null }> => {
    const { data, error } = await supabase
        .from("parcels_events")
        .select(
            `
            last_event_timestamp,
            last_event_is_successfully_completed
        `
        )
        .in("parcel_id", parcelIdList);

    if (error) {
        const logId = await logErrorReturnLogId("Error with fetch: Client parcels details", error);
        return {
            data: [],
            error: {
                errorMessage: "Error with fetch: Client parcels details.",
                logId: logId,
            },
        };
    }
    return {
        data: data,
        error: null,
    };
};

export const getClientParcelsStats = async (
    clientId: string
): Promise<{ data: ExpandedClientParcelStats[]; error: ClientParcelStatsError | null }> => {
    const idList = await getParcelIdList(clientId);

    const { data: parcelData, error: clientParcelStatsError } =
        await getAllClientParcelsStats(idList);

    if (clientParcelStatsError) {
        return {
            data: [],
            error: clientParcelStatsError,
        };
    }

    const deliveredParcels = parcelData.filter(
        (parcel) => parcel.last_event_is_successfully_completed
    );

    const todayTime = new Date();
    const sixMonthsAgo = sub(todayTime, { months: 6 });

    const deliveredLastSixMonths = deliveredParcels.filter((parcel) => {
        if (!parcel.last_event_timestamp) {
            return false;
        }
        const time = new Date(parcel.last_event_timestamp);
        return isAfter(time, sixMonthsAgo) && isBefore(time, todayTime);
    });
    return {
        data: [
            {
                totalParcels: parcelData.length,
                totalSuccessful: deliveredParcels.length,
                lastSixMonthsSuccessful: deliveredLastSixMonths.length,
            },
        ],
        error: null,
    };
};
