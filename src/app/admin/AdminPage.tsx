"use client";

import { NoSSR } from "next/dist/shared/lib/lazy-dynamic/dynamic-no-ssr";
import React, { ReactElement } from "react";
import UsersTable from "@/app/admin/usersTable/UsersTable";
import { Accordion, AccordionDetails, AccordionSummary } from "@mui/material";
import { ExpandMore } from "@mui/icons-material";
import TableSurface from "@/components/Tables/TableSurface";
import CreateUserForm from "@/app/admin/createUser/CreateUserForm";
import {
    faUsers,
    faUserPlus,
    faCity,
    faBuildingCircleArrowRight,
    faBoxOpen,
    IconDefinition,
    faServer,
    faRectangleList,
} from "@fortawesome/free-solid-svg-icons";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import CollectionCentresTable from "@/app/admin/collectionCentresTable/CollectionCentresTable";
import CreateCollectionCentreForm from "@/app/admin/createCollectionCentre/CreateCollectionCentreForm";
import PackingSlotsTable from "@/app/admin/packingSlotsTable/PackingSlotsTable";
import WebsiteDataTable from "./websiteDataTable/WebsiteDataTable";
import AuditLogTable from "./auditLogTable/AuditLogTable";

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

export const auditLogIcon = faRectangleList;

const AdminPage: React.FC = () => {
    const adminPanels: Panel[] = [
        {
            panelTitle: "Users Table",
            panelIcon: faUsers,
            panelContent: <UsersTable />,
        },
        { panelTitle: "Create User", panelIcon: faUserPlus, panelContent: <CreateUserForm /> },
        {
            panelTitle: "Collection Centres Table",
            panelIcon: faCity,
            panelContent: <CollectionCentresTable />,
        },
        {
            panelTitle: "Create Collection Centre",
            panelIcon: faBuildingCircleArrowRight,
            panelContent: <CreateCollectionCentreForm />,
        },
        {
            panelTitle: "Modify Packing Slots",
            panelIcon: faBoxOpen,
            panelContent: <PackingSlotsTable />,
        },
        {
            panelTitle: "Edit Website Data",
            panelIcon: faServer,
            panelContent: <WebsiteDataTable />,
        },
        {
            panelTitle: "View Audit Logs",
            panelIcon: auditLogIcon,
            panelContent: <AuditLogTable />,
        },
    ];

    return (
        <>
            {adminPanels.map(({ panelTitle, panelIcon, panelContent }) => {
                return (
                    <TableSurface key={panelTitle}>
                        <Accordion elevation={0}>
                            <AccordionSummary expandIcon={<ExpandMore />}>
                                <NoSSR>
                                    <PanelIcon size="2x" icon={panelIcon} />
                                </NoSSR>
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
