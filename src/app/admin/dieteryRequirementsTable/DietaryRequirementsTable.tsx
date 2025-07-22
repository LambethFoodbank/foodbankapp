"use client";

import { GridColDef } from "@mui/x-data-grid";
import React, { useCallback, useEffect, useState } from "react";
import StyledDataGrid from "@/app/admin/common/StyledDataGrid";
import {
    DietaryRequirementsTableRow,
    fetchDietaryRequirementsForTable,
} from "@/app/admin/dieteryRequirementsTable/DietaryRequirementsActions";
import Header from "@/app/admin/websiteDataTable/Header";
import { subscriptionStatusRequiresErrorMessage } from "@/common/subscriptionStatusRequiresErrorMessage";
import FloatingToast from "@/components/FloatingToast";
import supabase from "@/supabaseClient";

const DietaryRequirementsTable: React.FC = () => {
    const [rows, setRows] = useState<DietaryRequirementsTableRow[]>([]);
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
                { event: "*", schema: "public", table: "dietary_requirements_plus" },
                getDietaryRequirementsForTable
            )
            .subscribe((status, error) => {
                if (
                    subscriptionStatusRequiresErrorMessage(
                        status,
                        error,
                        "dietary_requirements_plus"
                    )
                ) {
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
            field: "dietary_requirement",
            headerName: "Dietary Requirement",
            flex: 1,
            width: 200,
            renderHeader: (params) => <Header {...params} />,
        },
        {
            field: "included",
            headerName: "Included",
            flex: 1,
            renderHeader: (params) => <Header {...params} />,
        },
        {
            field: "excluded",
            headerName: "Excluded",
            flex: 1,
            renderCell: (params) => (
                <div style={{ whiteSpace: "pre-line" }}>
                    {Array.isArray(params.value) ? params.value.join(", ") : ""}
                </div>
            ),
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
                    className="dietary-table"
                    aria-label="Dietary Requirements Table"
                    columns={dietaryRequirementsColumns}
                    getRowHeight={() => "auto"}
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
