import { FetchParcelError, fetchParcel } from "@/common/fetch";
import { ListType } from "@/common/databaseListTypes";
import supabase from "@/supabaseClient";
import { formatDateStringAsDate } from "@/common/format";

export interface ParcelInfo {
    voucherNumber: string;
    packingDate: string;
    packingSlot: string;
    collectionDate: string;
    collectionSite: string;
    listType: ListType;
}

interface ParcelInfoAndClientId {
    parcelInfo: ParcelInfo;
    clientId: string;
}

type ParcelInfoAndClientIdResponse =
    | {
          data: ParcelInfoAndClientId;
          error: null;
      }
    | {
          data: null;
          error: FetchParcelError;
      };

const formatDateToDateTime = (dateString: string | null): string => {
    if (dateString === null) {
        return "";
    }
    return new Date(dateString).toLocaleString("en-GB", {
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
    });
};

export const prepareParcelInfo = async (
    parcelID: string
): Promise<ParcelInfoAndClientIdResponse> => {
    const { data, error } = await fetchParcel(parcelID, supabase);
    if (error) {
        return { data: null, error: error };
    }
    const parcelInfo: ParcelInfo = {
        voucherNumber: data.voucher_number ?? "",
        packingDate: formatDateStringAsDate(data.packing_date) ?? "",
        packingSlot: data.packing_slot?.name ?? "",
        collectionDate: formatDateToDateTime(data.collection_datetime),
        collectionSite: data.collection_centre?.name ?? "",
        listType: data.list_type,
    };
    if (parcelInfo.collectionSite === "Delivery") {
        parcelInfo.collectionSite = "N/A - Delivery";
    }

    return { data: { parcelInfo: parcelInfo, clientId: data.client_id }, error: null };
};
