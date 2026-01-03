"use client";

import React, { useEffect, useState } from "react";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { Dayjs } from "dayjs";
import { ParcelsTableRow } from "@/app/parcels/parcelsTable/types";
import StatusesModal from "@/app/parcels/ActionBar/StatusesModal";
import { ParcelStatus } from "@/databaseUtils";
import { fetchParcelStatuses } from "@/app/parcels/parcelsTable/fetchParcelTableData";
import {
    saveParcelTableRowsStatus,
    SaveParcelStatusError,
    StatusType,
} from "@/app/parcels/ActionBar/saveStatus";

const nonMenuStatuses: StatusType[] = [
    "Packing Date Changed", //Generated when packing date is changed
    "Packing Slot Changed", //Generated when packing slot is changed
    "Out for Delivery", //Generated when driver overview pdf downloaded
    "Parcel Deleted", //Generated when parcel deleted
    "Shipping Labels Downloaded", //Generated when shipping labels pdf downloaded
    "Shopping List Downloaded", //Generated when shopping list pdf downloaded
];

const userFacingLabelForEmptyStatus = "No Status";

interface Props {
    fetchSelectedParcels: () => Promise<ParcelsTableRow[]>;
    postSuccessCallback: () => void;
    statusAnchorElement: HTMLElement | null;
    setStatusAnchorElement: React.Dispatch<React.SetStateAction<HTMLElement | null>>;
    setModalError: React.Dispatch<React.SetStateAction<string | null>>;
}

const getStatusErrorMessage = (statusError: SaveParcelStatusError): string => {
    switch (statusError.type) {
        case "eventInsertionFailed":
            return "Failed to save new parcel status.";
    }
};

export const getStatusErrorMessageWithLogId = (statusError: SaveParcelStatusError): string =>
    `${getStatusErrorMessage(statusError)} Log ID: ${statusError.logId}`;

const userFacingStatusString = (selectedStatus: StatusType | null): string =>
    selectedStatus && selectedStatus.length > 0 ? selectedStatus : userFacingLabelForEmptyStatus;

const Statuses: React.FC<Props> = ({
    fetchSelectedParcels,
    postSuccessCallback,
    statusAnchorElement,
    setStatusAnchorElement,
    setModalError,
}) => {
    const [selectedParcels, setSelectedParcels] = useState<ParcelsTableRow[]>([]);
    const [selectedStatus, setSelectedStatus] = useState<StatusType | null>(null);
    const [statusModal, setStatusModal] = useState(false);
    const [parcelStatuses, setParcelStatuses] = useState<ParcelStatus[] | null>(null);
    const [serverErrorMessage, setServerErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        const getParcelStatuses = async (): Promise<void> => {
            const { data: parcelStatusesData, error: parcelStatusesError } =
                await fetchParcelStatuses();
            if (parcelStatusesError) {
                switch (parcelStatusesError.type) {
                    case "failedToFetchStatuses":
                        setModalError(
                            `Unable to retrieve statuses filter for parcels. Log ID: ${parcelStatusesError.logId}`
                        );
                        return;
                }
            }
            setParcelStatuses(parcelStatusesData);
        };
        void getParcelStatuses();
    }, [setModalError]);

    const submitStatus = async (date?: Dayjs): Promise<void> => {
        setServerErrorMessage(null);
        if (selectedStatus === null) {
            setServerErrorMessage("Chosen status was not found.");
            return;
        }

        const { error } = await saveParcelTableRowsStatus(
            selectedParcels,
            selectedStatus,
            null,
            undefined,
            date?.toISOString()
        );
        if (error) {
            setServerErrorMessage(`${getStatusErrorMessage(error)} Log ID: ${error.logId}`);
        }
        if (!error) {
            setStatusModal(false);
            postSuccessCallback();
        }
    };

    const onMenuItemClick = (status: StatusType): (() => void) => {
        return async () => {
            try {
                const fetchedParcels = await fetchSelectedParcels();
                setSelectedParcels(fetchedParcels);
                setServerErrorMessage(null);
                if (fetchedParcels.length > 0) {
                    setSelectedStatus(status);
                    setStatusModal(true);
                    setStatusAnchorElement(null);
                    setModalError(null);
                } else {
                    setModalError("Please select at least 1 row.");
                }
            } catch {
                setModalError("Database error when fetching selected parcels");
                return;
            }
        };
    };

    return (
        <>
            <StatusesModal
                isOpen={statusModal}
                onClose={() => {
                    setStatusModal(false);
                    setModalError(null);
                }}
                selectedParcels={selectedParcels}
                header={"Apply Status: " + userFacingStatusString(selectedStatus)}
                headerId="status-modal-header"
                onSubmit={submitStatus}
                errorText={serverErrorMessage}
            >
                <></>
            </StatusesModal>

            <Menu
                open={statusAnchorElement !== null}
                onClose={() => setStatusAnchorElement(null)}
                anchorEl={statusAnchorElement}
            >
                {parcelStatuses &&
                    parcelStatuses
                        .filter((status) => !nonMenuStatuses.includes(status))
                        .map((status) => {
                            return (
                                <MenuItem
                                    key={userFacingStatusString(status)}
                                    onClick={onMenuItemClick(status)}
                                >
                                    {userFacingStatusString(status)}
                                </MenuItem>
                            );
                        })}
            </Menu>
        </>
    );
};

export default Statuses;
