"use client";

import { GridColDef, GridRowModesModel } from "@mui/x-data-grid";
import React, { useCallback, useEffect, useState } from "react";
import StyledDataGrid from "@/app/admin/common/StyledDataGrid";
import {
    DietaryRequirementsTableRow,
    fetchDietaryRequirementsForTable,
} from "@/app/admin/dieteryRequirementsTable/DietaryRequirementsActions";
import Header from "@/app/admin/websiteDataTable/Header";
import { subscriptionStatusRequiresErrorMessage } from "@/common/subscriptionStatusRequiresErrorMessage";
import FloatingToast from "@/components/FloatingToast";
import { AuditLog } from "@/server/auditLog";
import supabase from "@/supabaseClient";

function getBaseAuditLogForDietaryRequirementsAction(
    action: string,
    dietaryRequirementsRow: DietaryRequirementsTableRow,
    options?: {
        excludeDietaryRequirementsId?: boolean;
    }
): Pick<AuditLog, "action" | "content" | "collectionCentreId"> {
    return {
        action,
        content: {
            dietaryRequirement: dietaryRequirementsRow.dietary_requirement,
            included: dietaryRequirementsRow.included,
            excluded: dietaryRequirementsRow.excluded,
        },
        collectionCentreId: options?.excludeDietaryRequirementsId
            ? undefined
            : dietaryRequirementsRow.id,
    };
}

const DietaryRequirementsTable: React.FC = () => {
    const [rows, setRows] = useState<DietaryRequirementsTableRow[]>([]);
    const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({});
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const getDietaryRequirementsForTable = useCallback(async () => {
        setErrorMessage(null);
        const { data, error } = await fetchDietaryRequirementsForTable();
        if (error) {
            setErrorMessage("Error fetching data, please reload");
            return;
        }
        setRows(data);
        setIsLoading(false);
    }, []);

    useEffect(() => {
        void getDietaryRequirementsForTable();
    }, [getDietaryRequirementsForTable]);

    useEffect(() => {
        const subscriptionChannel = supabase
            .channel("dietary-requirements-table-changes")
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "dietary_requirements" },
                getDietaryRequirementsForTable
            )
            .subscribe((status, error) => {
                if (subscriptionStatusRequiresErrorMessage(status, error, "dietary_requirements")) {
                    setErrorMessage("Error fetching data, please reload");
                } else {
                    setErrorMessage(null);
                }
            });

        return () => {
            void supabase.removeChannel(subscriptionChannel);
        };
    }, [getDietaryRequirementsForTable]);

    const dietaryRequirementsColumns: GridColDef[] = [
        {
            field: "id",
            headerName: "Dietary Requirement",
            flex: 1,
            minWidth: 400,
            editable: true,
            renderHeader: (params) => <Header {...params} />,
        },
        {
            field: "isNew",
            headerName: "Included",
            flex: 1,
            editable: true,
            renderHeader: (params) => <Header {...params} />,
        },
        {
            field: "excluded",
            headerName: "Excluded",
            flex: 1,
            editable: true,
            renderHeader: (params) => <Header {...params} />,
        },
    ];

    return (
        <>
            {errorMessage && (
                <FloatingToast
                    message={errorMessage}
                    severity="warning"
                    variant="filled"
                ></FloatingToast>
            )}
            {rows && (
                <StyledDataGrid
                    rows={rows}
                    aria-label="Dietary Requirements Table"
                    columns={dietaryRequirementsColumns}
                    editMode="row"
                    rowModesModel={rowModesModel}
                    onRowModesModelChange={setRowModesModel}
                    loading={isLoading}
                    getRowClassName={(params) =>
                        (params.indexRelativeToCurrentPage + 1) % 2 === 0
                            ? "datagrid-row-even"
                            : "datagrid-row-odd"
                    }
                    hideFooter
                />
            )}
        </>
    );
};

export default DietaryRequirementsTable;
