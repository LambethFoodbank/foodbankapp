import { EmergencyBagsTableRow } from "./types";
import { DbEmergencyBagRow } from "@/databaseUtils";

export type ProcessEmergencyBagDataResult =
    | {
          emergencyBagTableRows: EmergencyBagsTableRow[];
          error: null;
      }
    | {
          emergencyBagTableRows: null;
          error: {
              type: "invalidInputLengths";
              logId: string;
          };
      };

const convertEmergencyBagDBtoEBRow = async (
    processingData: DbEmergencyBagRow[]
): Promise<ProcessEmergencyBagDataResult> => {
    return {
        emergencyBagTableRows: processingData.map((emergencyBag) => {
            return {
                emergencyBagId: emergencyBag.emergency_bag_id ?? "",
                amount: emergencyBag.amount ?? 0,
                type: emergencyBag.type ?? "",
                deliveryCollection: {
                    collectionCentreName: emergencyBag.collection_centre_name ?? "-",
                    collectionCentreAcronym: emergencyBag.collection_centre_acronym ?? "-",
                },
                lastStatus: { name: "", eventData: "", timestamp: new Date(), workflowOrder: -1 }, // TODO: implement in actions ticket
                allStatuses: [""], // TODO: implement in actions ticket
                packingDate: emergencyBag.packing_date ? new Date(emergencyBag.packing_date) : null,
                createdAt: emergencyBag.created_at ? new Date(emergencyBag.created_at) : null,
            };
        }),
        error: null,
    };
};
//
// export const processLastStatusEmergencyBag = (
//     event:
//         | Pick<
//               ViewSchema["emergency_bags_plus"],
//               | "last_status_event_name"
//               | "last_status_timestamp"
//               | "last_status_event_data"
//               | "last_status_workflow_order"
//           >
//         | undefined
//         | null
// ): EmergencyBagsTableRow["lastStatus"] => {
//     if (!(event?.last_status_event_name && event.last_status_timestamp)) {
//         return null;
//     }
//
//     return {
//         name: event.last_status_event_name,
//         eventData: event.last_status_event_data ?? "",
//         timestamp: new Date(event.last_status_timestamp),
//         workflowOrder: event.last_status_workflow_order ?? -1, //for now
//     };
// };

export default convertEmergencyBagDBtoEBRow;
