import { CongestionChargeDetails, ParcelsTableRow } from "./types";
import { familyCountToFamilyCategory } from "@/app/clients/getExpandedClientDetails";
import { logErrorReturnLogId } from "@/logger/logger";
import { DbParcelRow, ViewSchema } from "@/databaseUtils";
import { parcelsPageDeletedClientDisplayName } from "./format";

type ProcessParcelDataResult =
    | {
          parcelTableRows: ParcelsTableRow[];
          error: null;
      }
    | {
          parcelTableRows: null;
          error: {
              type: "invalidInputLengths";
              logId: string;
          };
      };

const convertParcelDbtoParcelRow = async (
    processingData: DbParcelRow[],
    congestionCharge: CongestionChargeDetails[]
): Promise<ProcessParcelDataResult> => {
    if (processingData.length !== congestionCharge.length) {
        const logId = await logErrorReturnLogId(
            `Failed to process parcel data due to invalid input lengths, got ${processingData.length} parcels and ${congestionCharge.length} congestion charges`
        );

        return {
            parcelTableRows: null,
            error: {
                type: "invalidInputLengths",
                logId,
            },
        };
    }

    return {
        parcelTableRows: processingData.map((parcel, index) => {
            const clientActive = parcel.client_is_active;
            return {
                parcelId: parcel.parcel_id ?? "",
                clientId: parcel.client_id ?? "",
                fullName: clientActive
                    ? parcel.client_full_name ?? ""
                    : parcelsPageDeletedClientDisplayName,
                familyCategory: clientActive
                    ? familyCountToFamilyCategory(parcel.family_count ?? 0)
                    : "-",
                addressPostcode: clientActive ? parcel.client_address_postcode : "-",
                phoneNumber: clientActive ? parcel.client_phone_number ?? "" : "-",
                deliveryCollection: {
                    collectionCentreName: parcel.collection_centre_name ?? "-",
                    collectionCentreAcronym: parcel.collection_centre_acronym ?? "-",
                    congestionChargeApplies: congestionCharge[index].congestionCharge,
                },
                collectionDatetime: parcel.collection_datetime
                    ? new Date(parcel.collection_datetime)
                    : null,
                packingSlot: parcel.packing_slot_name,
                lastStatus: processLastStatus(parcel),
                voucherNumber: parcel.voucher_number,
                packingDate: parcel.packing_date ? new Date(parcel.packing_date) : null,
                iconsColumn: {
                    flaggedForAttention: parcel.client_is_active
                        ? parcel.client_flagged_for_attention ?? false
                        : false,
                    requiresFollowUpPhoneCall: parcel.client_is_active
                        ? parcel.client_signposting_call_required ?? false
                        : false,
                },
                createdAt: parcel.created_at ? new Date(parcel.created_at) : null,
                clientIsActive: parcel.client_is_active ?? false,
            };
        }),
        error: null,
    };
};

export const processLastStatus = (
    event:
        | Pick<
              ViewSchema["parcels_plus"],
              | "last_status_event_name"
              | "last_status_timestamp"
              | "last_status_event_data"
              | "last_status_workflow_order"
          >
        | undefined
        | null
): ParcelsTableRow["lastStatus"] => {
    if (!(event?.last_status_event_name && event.last_status_timestamp)) {
        return null;
    }

    return {
        name: event.last_status_event_name,
        eventData: event.last_status_event_data ?? "",
        timestamp: new Date(event.last_status_timestamp),
        workflowOrder: event.last_status_workflow_order ?? -1, //for now
    };
};

export default convertParcelDbtoParcelRow;
