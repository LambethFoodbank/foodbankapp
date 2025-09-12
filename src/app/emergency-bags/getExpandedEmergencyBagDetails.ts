import supabase from "@/supabaseClient";
import { logErrorReturnLogId } from "@/logger/logger";
import { formatDateTime, formatDatetimeAsDate } from "@/common/format";
import {
    convertDataToDataForDataViewer,
    Data,
    DataForDataViewer,
} from "@/components/DataViewer/DataViewer";

type FetchExpandedEmergencyBagDetailsResult =
    | {
          emergencyBagDetails: ExpandedEmergencyBagDetails;
          error: null;
      }
    | {
          emergencyBagDetails: null;
          error: FetchExpandedEmergencyBagDetailsError;
      };

export interface FetchExpandedEmergencyBagDetailsError {
    type: FetchExpandedEmergencyBagDetailsErrorType;
    logId: string;
}

type FetchExpandedEmergencyBagDetailsErrorType = "failedToFetchEmergencyBagDetails";

const getExpandedEmergencyBagDetails = async (
    emergencyBagId: string
): Promise<FetchExpandedEmergencyBagDetailsResult> => {
    const { data: rawEmergencyBagDetails, error } = await supabase
        .from("emergency_bags")
        .select(
            `
            type,
            amount,
            last_updated,
            packing_date,
            created_at,
            collection_centre:collection_centres (
                name,
                is_delivery,
                is_shown
            )
            `
        )
        .eq("id", emergencyBagId)
        .single();

    if (error || !rawEmergencyBagDetails) {
        const logId = await logErrorReturnLogId("Failed to fetch expanded emergency bag details", {
            error,
        });
        return {
            emergencyBagDetails: null,
            error: {
                type: "failedToFetchEmergencyBagDetails",
                logId,
            },
        };
    }

    return {
        emergencyBagDetails: {
            expandedEmergencyBagData: {
                type: rawEmergencyBagDetails.type,
                amount: rawEmergencyBagDetails.amount,
                collectionCentre: formatDeliveryOrCollection(
                    rawEmergencyBagDetails.collection_centre?.name ?? "",
                    rawEmergencyBagDetails.collection_centre?.is_shown ?? false
                ),
                packingDate: formatDatetimeAsDate(rawEmergencyBagDetails.packing_date),
                createdAt: formatDateTime(rawEmergencyBagDetails.created_at),
            },
        },
        error: null,
    };
};

interface EmergencyBagData extends Data {
    packingDate: string;
    createdAt: string;
    type: string;
    amount: number;
    collectionCentre: string;
}

export interface ExpandedEmergencyBagDetails {
    expandedEmergencyBagData: EmergencyBagData;
    // events: EventTableRow[]; TODO: VFB-494
}

const formatDeliveryOrCollection = (collectionCentreName: string, isShown: boolean): string => {
    const methodString = isShown ? collectionCentreName : `${collectionCentreName} (inactive)`;
    return `${methodString}`;
};

export const getExpandedEmergencyBagDataForDataViewer = (
    emergencyBagData: EmergencyBagData
): DataForDataViewer => {
    return convertDataToDataForDataViewer(emergencyBagData);
};

export default getExpandedEmergencyBagDetails;
