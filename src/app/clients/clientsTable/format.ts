import { DeleteClientError } from "../deleteClient";
import { IsClientActiveError } from "../getExpandedClientDetails";
import { SaveParcelStatusError } from "@/app/parcels/ActionBar/saveStatus";

export const getIsClientActiveErrorMessage = (error: IsClientActiveError): string => {
    switch (error.type) {
        case "failedClientIsActiveFetch":
            return `Failed to determine whether client is active. Please reload. Log ID: ${error.logId}`;
    }
};

export const getDeleteClientErrorMessage = (
    error: DeleteClientError | SaveParcelStatusError
): string => {
    switch (error.type) {
        case "failedClientDeletion":
            return `Failed to delete client. Please try again later. Log ID: ${error.logId}`;
        case "eventInsertionFailed":
            return `Failed to delete client parcel. Please try again later. Log ID: ${error.logId}`;
    }
};
