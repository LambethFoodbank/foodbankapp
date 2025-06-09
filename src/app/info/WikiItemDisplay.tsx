"use client";

import React from "react";
import { DbWikiRow } from "@/databaseUtils";
import {
    ReorderArrowDiv,
    WikiItemAccordionSurface,
    WikiItemDetailsTextBreaker,
    WikiUpdateDataButton,
} from "@/app/info/StyleComponents";
import { Accordion, AccordionDetails, AccordionSummary } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { convertContentToElements, DirectionString } from "@/app/info/WikiItems";
import OrganisationRoleDependentView from "@/app/info/OrganisationRoleDependentView";
import EditIcon from "@mui/icons-material/Edit";
import KeyboardDoubleArrowUpIcon from "@mui/icons-material/KeyboardDoubleArrowUp";
import KeyboardDoubleArrowDownIcon from "@mui/icons-material/KeyboardDoubleArrowDown";

interface DefaultViewProps {
    rowData: DbWikiRow;
    openEditMode: () => void;
    swapRows: (row1: DbWikiRow, direction: DirectionString) => void;
}

const WikiItemDisplay: React.FC<DefaultViewProps> = ({ rowData, openEditMode, swapRows }) => {
    return (
        <>
            <OrganisationRoleDependentView>
                <ReorderArrowDiv>
                    <WikiUpdateDataButton
                        onClick={() => {
                            swapRows(rowData, "up");
                        }}
                        data-testid={"#swap-up-" + rowData.row_order}
                    >
                        <KeyboardDoubleArrowUpIcon />
                    </WikiUpdateDataButton>
                    <WikiUpdateDataButton
                        onClick={() => {
                            swapRows(rowData, "down");
                        }}
                        data-testid={"#swap-down-" + rowData.row_order}
                    >
                        <KeyboardDoubleArrowDownIcon />
                    </WikiUpdateDataButton>
                </ReorderArrowDiv>
                <WikiUpdateDataButton
                    onClick={() => {
                        openEditMode();
                    }}
                    data-testid={"#edit-" + rowData.row_order}
                >
                    <EditIcon />
                </WikiUpdateDataButton>
            </OrganisationRoleDependentView>
            <WikiItemAccordionSurface>
                <Accordion elevation={0}>
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel1-content"
                        id="panel1-header"
                    >
                        <h2>{rowData.title}</h2>
                    </AccordionSummary>
                    <AccordionDetails>
                        <WikiItemDetailsTextBreaker>
                            {convertContentToElements(rowData.content)}
                        </WikiItemDetailsTextBreaker>
                    </AccordionDetails>
                </Accordion>
            </WikiItemAccordionSurface>
        </>
    );
};

export default WikiItemDisplay;
