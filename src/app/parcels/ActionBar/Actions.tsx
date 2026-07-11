"use client";

import React, { useContext, useState } from "react";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { ParcelsTableRow } from "../parcelsTable/types";
import { ActionModalProps } from "./ActionModals/GeneralActionModal";
import { allRoles, organisationRoles, RoleUpdateContext } from "@/app/roles";
import { UserRole } from "@/databaseUtils";
import DayOverviewModal from "./ActionModals/DayOverviewModal";
import DeleteParcelModal from "./ActionModals/DeleteParcelModal";
import DriverOverviewModal from "./ActionModals/DriverOverviewModal";
import GenerateMapModal from "./ActionModals/GenerateMapModal";
import ShippingLabelModal from "./ActionModals/ShippingLabelModal";
import ShoppingListModal from "./ActionModals/ShoppingListModal";
import DateChangeModal from "./ActionModals/DateChangeModal";
import SlotChangeModal from "./ActionModals/SlotChangeModal";
import SignPostingReportModal from "./ActionModals/SignpostingReportModal";
import PendingMoreInfoReportModal from "./ActionModals/PendingMoreInfoReportModal";
import VoucherReportModal from "@/app/parcels/ActionBar/ActionModals/VoucherReportModal";
import SelectedParcelsReportModal from "@/app/parcels/ActionBar/ActionModals/SelectedParcelsReportModal";

const isNotAtLeastOne = (value: number): boolean => {
    return value < 1;
};

const errorMessageForIsNotAtLeastOne = "Please select at least one parcel.";

const doesNotEqualZero = (value: number): boolean => {
    return value !== 0;
};

const errorMesageForDoesNotEqualZero = "This action requires no parcel selection.";

export type ActionName =
    | "Change Packing Date"
    | "Change Packing Slot"
    | "Download Day Overview"
    | "Download Shopping Lists"
    | "Download Shipping Labels"
    | "Generate Map"
    | "Download Driver Overview"
    | "Delete Parcel"
    | "Download Signposting Report"
    | "Download Missing Voucher Report"
    | "Download Pending More Info Report"
    | "Download Selected Parcels Report";

type ActionTypes = {
    actionName: ActionName;
    errorCondition: (value: number) => boolean;
    errorMessage: string;
    availableToRole: UserRole[];
};

const availableActions: ActionTypes[] = [
    {
        actionName: "Change Packing Date",
        errorCondition: isNotAtLeastOne,
        errorMessage: errorMessageForIsNotAtLeastOne,
        availableToRole: organisationRoles,
    },
    {
        actionName: "Change Packing Slot",
        errorCondition: isNotAtLeastOne,
        errorMessage: errorMessageForIsNotAtLeastOne,
        availableToRole: organisationRoles,
    },
    {
        actionName: "Download Day Overview",
        errorCondition: isNotAtLeastOne,
        errorMessage: errorMessageForIsNotAtLeastOne,
        availableToRole: allRoles,
    },
    {
        actionName: "Download Shopping Lists",
        errorCondition: isNotAtLeastOne,
        errorMessage: errorMessageForIsNotAtLeastOne,
        availableToRole: allRoles,
    },
    {
        actionName: "Download Shipping Labels",
        errorCondition: isNotAtLeastOne,
        errorMessage: errorMessageForIsNotAtLeastOne,
        availableToRole: allRoles,
    },
    {
        actionName: "Generate Map",
        errorCondition: isNotAtLeastOne,
        errorMessage: errorMessageForIsNotAtLeastOne,
        availableToRole: allRoles,
    },
    {
        actionName: "Download Driver Overview",
        errorCondition: isNotAtLeastOne,
        errorMessage: errorMessageForIsNotAtLeastOne,
        availableToRole: allRoles,
    },
    {
        actionName: "Delete Parcel",
        errorCondition: isNotAtLeastOne,
        errorMessage: errorMessageForIsNotAtLeastOne,
        availableToRole: organisationRoles,
    },
    {
        actionName: "Download Signposting Report",
        errorCondition: doesNotEqualZero,
        errorMessage: errorMesageForDoesNotEqualZero,
        availableToRole: organisationRoles,
    },
    {
        actionName: "Download Missing Voucher Report",
        errorCondition: doesNotEqualZero,
        errorMessage: errorMesageForDoesNotEqualZero,
        availableToRole: organisationRoles,
    },
    {
        actionName: "Download Pending More Info Report",
        errorCondition: doesNotEqualZero,
        errorMessage: errorMesageForDoesNotEqualZero,
        availableToRole: organisationRoles,
    },
    {
        actionName: "Download Selected Parcels Report",
        errorCondition: isNotAtLeastOne,
        errorMessage: errorMessageForIsNotAtLeastOne,
        availableToRole: organisationRoles,
    },
];

interface Props {
    fetchSelectedParcels: () => Promise<ParcelsTableRow[]>;
    postSuccessCallback: () => void;
    actionAnchorElement: HTMLElement | null;
    setActionAnchorElement: React.Dispatch<React.SetStateAction<HTMLElement | null>>;
    setModalError: React.Dispatch<React.SetStateAction<string | null>>;
}

const getActionModal = (
    actionName: ActionName,
    actionModalProps: ActionModalProps
): React.ReactElement<any> => {
    const elementKey = `${actionName}_modal`;
    switch (actionName) {
        case "Change Packing Date":
            return <DateChangeModal key={elementKey} {...actionModalProps} />;
        case "Change Packing Slot":
            return <SlotChangeModal key={elementKey} {...actionModalProps} />;
        case "Download Shipping Labels":
            return <ShippingLabelModal key={elementKey} {...actionModalProps} />;
        case "Download Shopping Lists":
            return <ShoppingListModal key={elementKey} {...actionModalProps} />;
        case "Download Driver Overview":
            return <DriverOverviewModal key={elementKey} {...actionModalProps} />;
        case "Generate Map":
            return <GenerateMapModal key={elementKey} {...actionModalProps} />;
        case "Download Day Overview":
            return <DayOverviewModal key={elementKey} {...actionModalProps} />;
        case "Delete Parcel":
            return <DeleteParcelModal key={elementKey} {...actionModalProps} />;
        case "Download Signposting Report":
            return <SignPostingReportModal key={elementKey} {...actionModalProps} />;
        case "Download Missing Voucher Report":
            return <VoucherReportModal key={elementKey} {...actionModalProps} />;
        case "Download Pending More Info Report":
            return <PendingMoreInfoReportModal key={elementKey} {...actionModalProps} />;
        case "Download Selected Parcels Report":
            return <SelectedParcelsReportModal key={elementKey} {...actionModalProps} />;
    }
};

const Actions: React.FC<Props> = ({
    fetchSelectedParcels,
    postSuccessCallback,
    actionAnchorElement,
    setActionAnchorElement,
    setModalError,
}) => {
    const [selectedParcels, setSelectedParcels] = useState<ParcelsTableRow[]>([]);
    const [modalToDisplay, setModalToDisplay] = useState<ActionName | null>(null);
    const { role } = useContext(RoleUpdateContext);

    const getAvailableActionsForUserRole = (): ActionTypes[] => {
        if (role === null) {
            return [];
        }
        return availableActions.filter((action) => {
            return action.availableToRole.includes(role);
        });
    };

    const availableActionsForUserRole = getAvailableActionsForUserRole();

    const onModalClose = (): void => {
        setModalToDisplay(null);
        setModalError(null);
    };

    const onMenuItemClick = (
        key: ActionName,
        errorCondition: (value: number) => boolean,
        errorMessage: string
    ): (() => void) => {
        return async () => {
            try {
                const fetchedParcels = await fetchSelectedParcels();
                setSelectedParcels(fetchedParcels);
                if (errorCondition(fetchedParcels.length)) {
                    setActionAnchorElement(null);
                    setModalError(errorMessage);
                } else {
                    setModalToDisplay(key);
                    setActionAnchorElement(null);
                    setModalError(null);
                    return;
                }
            } catch {
                setModalError("Database error when fetching selected parcels");
                return;
            }
        };
    };

    return (
        <>
            {availableActionsForUserRole.map(({ actionName }) => {
                return (
                    modalToDisplay === actionName &&
                    getActionModal(actionName, {
                        isOpen: true,
                        onClose: onModalClose,
                        selectedParcels: selectedParcels,
                        header: modalToDisplay,
                        headerId: "action-modal-header",
                        actionName: modalToDisplay,
                        postSuccessCallback: postSuccessCallback,
                    })
                );
            })}
            {actionAnchorElement && (
                <Menu
                    open
                    onClose={() => setActionAnchorElement(null)}
                    anchorEl={actionAnchorElement}
                >
                    {availableActionsForUserRole.map(
                        ({ actionName, errorCondition, errorMessage }) => {
                            return (
                                <MenuItem
                                    key={actionName}
                                    onClick={onMenuItemClick(
                                        actionName,
                                        errorCondition,
                                        errorMessage
                                    )}
                                >
                                    {actionName}
                                </MenuItem>
                            );
                        }
                    )}
                </Menu>
            )}
        </>
    );
};

export default Actions;
