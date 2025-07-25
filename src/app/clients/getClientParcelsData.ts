import supabase from "@/supabaseClient";
import { DatabaseError } from "@/app/errorClasses";
import { Data } from "@/components/DataViewer/DataViewer";
import { logErrorReturnLogId } from "@/logger/logger";
import { formatDatetimeAsDate } from "@/common/format";
import { ex } from "@fullcalendar/core/internal-common";

export type RawClientParcelsDetails = Awaited<ReturnType<typeof getRawClientParcelsDetails>>;

type ClientParcelDetails = RawClientParcelsDetails[number];

export interface ParcelsDetail {
    parcel_id: string;
    collection_centre?: { name: string } | null;
    packing_date: string | null;
    voucher_number?: string | null;
}

export const getClientParcelsDetails = async (
    clientId: string
): Promise<ExpandedClientParcelDetails[]> => {
    const rawClientParcelsDetails = await getRawClientParcelsDetails(clientId);
    const formattedList = rawClientParcelsDetails.map(rawDataToClientParcelsDetails);
    return formattedList;
};

const getRawClientParcelsDetails = async (clientId: string): Promise<ParcelsDetail[]> => {
    const { data, error } = await supabase
        .from("parcels")
        .select(
            `
        parcel_id:primary_key,
        collection_centre:collection_centres (
            name
         ),
        packing_date,
        voucher_number
    `
        )
        .eq("client_id", clientId)
        .order("packing_date", { ascending: false });

    if (error) {
        const logId = await logErrorReturnLogId("Error with fetch: Client parcels", error);
        throw new DatabaseError("fetch", "client parcels", logId);
    }

    return data;
};

export interface ExpandedClientParcelDetails extends Data {
    parcelId: string;
    voucherNumber: string;
    packingDate: string;
    collectionCentre: string;
}

export interface ExpandedClientParcelStats extends Data {
    totalParcels: number;
    totalSuccessful: number;
    lastSixMonthsSuccessful: number;
}

export const rawDataToClientParcelsDetails = (
    parcel: ClientParcelDetails
): ExpandedClientParcelDetails => {
    return {
        parcelId: parcel.parcel_id,
        voucherNumber: parcel.voucher_number ?? "-",
        packingDate: formatDatetimeAsDate(parcel.packing_date),
        collectionCentre: parcel.collection_centre?.name ?? "-",
    };
};


export const getClientParcelsStats = async (clientId: string): Promise<ExpandedClientParcelStats[]> => {
    const parcelsData: ExpandedClientParcelDetails[] = await getClientParcelsDetails(clientId);
    let parcelIdList: string[] = parcelsData.map((clientDetails) => clientDetails.parcelId);
    // console.log(parcelsData);

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
    // console.log(data.length) // total parcels
    let deliveredParcels = data.filter((parcel) =>
        parcel.all_events?.includes("Delivered") ||
        parcel.all_events?.includes("Parcel Collected") ||
        parcel.all_events?.includes("Fulfilled with Trussell")
    );
    // console.log(deliveredParcels.length); // total successful parcels

    const todayTime = new Date().getTime();
    let sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(new Date().getMonth() - 6);
    const sixMonthsAgoTime = sixMonthsAgo.getTime();

    let deliveredLastSixMonths = deliveredParcels.filter((parcel) => {
        if(!parcel.last_event_timestamp) return false;
        let time = Date.parse(parcel.last_event_timestamp);
        return time >= sixMonthsAgoTime && time <= todayTime;
        }
    );
    // console.log(deliveredLastSixMonths.length);
    
    return [{
        totalParcels: data.length,
        totalSuccessful: deliveredParcels.length,
        lastSixMonthsSuccessful: deliveredLastSixMonths.length
    }];

}
