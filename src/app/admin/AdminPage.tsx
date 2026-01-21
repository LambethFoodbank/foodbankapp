"use client";

import React, { ReactElement } from "react";
import UsersTable from "@/app/admin/usersTable/UsersTable";
import { Accordion, AccordionDetails, AccordionSummary } from "@mui/material";
import { ExpandMore } from "@mui/icons-material";
import TableSurface from "@/components/Tables/TableSurface";
import CreateUserForm from "@/app/admin/createUser/CreateUserForm";
import {
    faUsers,
    faUserPlus,
    faBuildingCircleArrowRight,
    faBoxOpen,
    IconDefinition,
    faServer,
    faRectangleList,
    faTruck,
} from "@fortawesome/free-solid-svg-icons";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import CollectionCentresTable from "@/app/admin/collectionCentresTable/CollectionCentresTable";
import PackingSlotsTable from "@/app/admin/packingSlotsTable/PackingSlotsTable";
import WebsiteDataTable from "./websiteDataTable/WebsiteDataTable";
import DeliveryAreasTable from "@/app/admin/deliveryAreasTable/DeliveryAreasTable";
import { faBowlFood } from "@fortawesome/free-solid-svg-icons/faBowlFood";
import DietaryRequirementsTable from "@/app/admin/dietaryRequirementsTable/DietaryRequirementsTable";

const PanelTitle = styled.h2`
    text-transform: uppercase;
`;

interface Panel {
    panelTitle: string;
    panelIcon: IconDefinition;
    panelContent: ReactElement;
}

const PanelIcon = styled(FontAwesomeIcon)`
    padding-right: 0.9rem;
`;

const AdminPage: React.FC = () => {
    const adminPanels: Panel[] = [
        {
            panelTitle: "Users",
            panelIcon: faUsers,
            panelContent: <UsersTable />,
        },
        { panelTitle: "Create User", panelIcon: faUserPlus, panelContent: <CreateUserForm /> },
        {
            panelTitle: "Collection Centres",
            panelIcon: faBuildingCircleArrowRight,
            panelContent: <CollectionCentresTable />,
        },
        {
            panelTitle: "Modify Packing Slots",
            panelIcon: faBoxOpen,
            panelContent: <PackingSlotsTable />,
        },
        {
            panelTitle: "Dietary Requirements",
            panelIcon: faBowlFood,
            panelContent: <DietaryRequirementsTable />,
        },
        {
            panelTitle: "Edit Delivery Areas",
            panelIcon: faTruck,
            panelContent: <DeliveryAreasTable />,
        },
        {
            panelTitle: "Edit Website Data",
            panelIcon: faServer,
            panelContent: <WebsiteDataTable />,
        },
    ];

    return (
        <>
            {adminPanels.map(({ panelTitle, panelIcon, panelContent }) => {
                return (
                    <TableSurface key={panelTitle}>
                        <Accordion elevation={0}>
                            <AccordionSummary
                                expandIcon={<ExpandMore />}
                                aria-label={`Section: ${panelTitle}`}
                            >
                                <PanelIcon size="2x" icon={panelIcon} />
                                <PanelTitle>{panelTitle}</PanelTitle>
                            </AccordionSummary>
                            <AccordionDetails>{panelContent}</AccordionDetails>
                        </Accordion>
                    </TableSurface>
                );
            })}
        </>
    );
};

export default AdminPage;
