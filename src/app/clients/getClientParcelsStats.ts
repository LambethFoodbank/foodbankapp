import supabase from "@/supabaseClient";
import { DatabaseError } from "@/app/errorClasses";
import { Data } from "@/components/DataViewer/DataViewer";
import { logErrorReturnLogId } from "@/logger/logger";
import { ExpandedClientParcelDetails, getClientParcelsDetails } from "./getClientParcelsData";

export interface ExpandedClientParcelStats extends Data {
    totalParcels: number;
    totalSuccessful: number;
    lastSixMonthsSuccessful: number;
}

interface ParcelStatsInfo extends Data {
    last_event_timestamp: string | null;
    all_events: string[] | null;
}

const getParcelIdList = async (clientId: string): Promise<string[]> => {
    const parcelsData: ExpandedClientParcelDetails[] = await getClientParcelsDetails(clientId);
    return parcelsData.map((clientDetails) => clientDetails.parcelId);
}


const getAllClientParcelsStats = async (parcelIdList: string[]): Promise<ParcelStatsInfo[]> => {

    const { data, error } = await supabase
        .from("parcels_events")
        .select(
            `
            last_event_timestamp,
            all_events
        `
        )
        .in("parcel_id", parcelIdList);

        if (error) {
        const logId = await logErrorReturnLogId("Error with fetch: Client parcels details", error);
        throw new DatabaseError("fetch", "client parcels", logId);
    }

    return data;
}

export const getClientParcelsStats = async (clientId: string): Promise<ExpandedClientParcelStats[]> => {
    
    const idList = await getParcelIdList(clientId);

    const parcelData = await getAllClientParcelsStats(idList);

    const deliveredParcels = parcelData.filter((parcel) =>
        parcel.all_events?.includes("Delivered") ||
        parcel.all_events?.includes("Parcel Collected") ||
        parcel.all_events?.includes("Fulfilled with Trussell")
    );

    const todayTime = new Date().getTime();
    let sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(new Date().getMonth() - 6);
    const sixMonthsAgoTime = sixMonthsAgo.getTime();

    const deliveredLastSixMonths = deliveredParcels.filter((parcel) => {
        if(!parcel.last_event_timestamp) return false;
        let time = Date.parse(parcel.last_event_timestamp);
        return time >= sixMonthsAgoTime && time <= todayTime;
        }
    );
    return [{
        totalParcels: parcelData.length,
        totalSuccessful: deliveredParcels.length,
        lastSixMonthsSuccessful: deliveredLastSixMonths.length
    }];

}
