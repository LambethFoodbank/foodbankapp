import supabase from "@/supabaseClient";
import { DatabaseError } from "@/app/errorClasses";
import { Data } from "@/components/DataViewer/DataViewer";
import { logErrorReturnLogId } from "@/logger/logger";
import { formatDatetimeAsDate } from "@/common/format";
import { signpostingCallOptions } from "@/app/parcels/form/formSections/SignpostingCallCard";
import { formatRequirementsByCanonicalOrder } from "@/app/clients/getExpandedClientDetails";

export type RawClientParcelsDetails = Awaited<ReturnType<typeof getRawClientParcelsDetails>>;

type ClientParcelDetails = RawClientParcelsDetails[number];

export interface ParcelsDetail {
    parcel_id: string;
    collection_centre?: { name: string } | null;
    packing_date: string | null;
    voucher_number?: string | null;
    signposting_call_required: boolean | null;
    signposting_call_reasons: string[] | null;
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
        voucher_number,
        signposting_call_required,
        signposting_call_reasons
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

export const rawDataToClientParcelsDetails = (
    parcel: ClientParcelDetails
): ExpandedClientParcelDetails => {
    return {
        parcelId: parcel.parcel_id,
        voucherNumber: parcel.voucher_number ?? "-",
        packingDate: formatDatetimeAsDate(parcel.packing_date),
        collectionCentre: parcel.collection_centre?.name ?? "-",
        signpostingCallRequired: parcel.signposting_call_required ?? false,
        signpostingCallReasons:
            parcel.signposting_call_required === true
                ? formatRequirementsByCanonicalOrder(
                      parcel.signposting_call_reasons,
                      signpostingCallOptions
                  )
                : "",
    };
};
