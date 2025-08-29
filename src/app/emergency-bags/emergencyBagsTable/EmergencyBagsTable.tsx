import { BreakPointConfig, Row, ServerPaginatedTable } from "@/components/Tables/Table";
import TableSurface from "@/components/Tables/TableSurface";
import { DateRangeState } from "@/components/DateInputs/DateRangeInputs";
import {
    defaultNumberOfParcelsPerPage,
    numberOfParcelsPerPageOptions,
} from "@/app/parcels/parcelsTable/constants";
import { useCallback, useEffect, useRef, useState } from "react";
import { searchForBreakPoints } from "@/app/parcels/parcelsTable/conditionalStyling";
import { subscriptionStatusRequiresErrorMessage } from "@/common/subscriptionStatusRequiresErrorMessage";
import { EmergencyBagsFilter, EmergencyBagsSortState, EmergencyBagsTableRow } from "./types";
import { getEmergencyBagsTableDataAndAllIds } from "./fetchEmergencyBagTableData";
import { getEmergencyBagDataErrorMessage } from "./format";
import { DbEmergencyBagRow } from "@/databaseUtils";
import {
    emergencyBagTableDefaultShownHeaders,
    emergencyBagTableHeaderKeysAndLabels,
    emergencyBagTableToggleableHeaders,
} from "@/app/emergency-bags/emergencyBagsTable/headers";
import emergencyBagsSortableColumns, {
    defaultEmergencyBagsSortConfig,
} from "@/app/emergency-bags/emergencyBagsTable/sortableColumns";
import supabase from "@/supabaseClient";

interface EmergencyBagsTableProps {
    checkedEmergencyBagIds: string[];
    setCheckedEmergencyBagIds: (ids: string[]) => void;
    openEmergencyBagModal: (emergencyBagId: string) => void;
    sortState: EmergencyBagsSortState;
    setSortState: (sortState: EmergencyBagsSortState) => void;
    appliedFilters: (
        | EmergencyBagsFilter<string>
        | EmergencyBagsFilter<DateRangeState>
        | EmergencyBagsFilter<string[]>
    )[];
    areFiltersLoadingForFirstTime: boolean;
    setErrorMessage: (errorMessage: string | null) => void;
}

const EmergencyBagsTable: React.FC<EmergencyBagsTableProps> = ({
    checkedEmergencyBagIds,
    setCheckedEmergencyBagIds,
    openEmergencyBagModal,
    sortState,
    setSortState,
    appliedFilters,
    areFiltersLoadingForFirstTime,
    setErrorMessage,
}) => {
    const [isLoading, setIsLoading] = useState(true);
    const [emergencyBagsDataPortion, setEmergencyBagsDataPortion] = useState<
        EmergencyBagsTableRow[]
    >([]);
    const [filteredEmergencyBagCount, setFilteredEmergencyBagCount] = useState<number>(0);
    const [allFilteredEmergencyBagIds, setAllFilteredEmergencyBagIds] = useState<string[]>([]);

    const [emergencyBagRowBreakPointConfig, setEmergencyBagRowBreakPointConfig] = useState<
        BreakPointConfig[]
    >([]);

    const [isAllCheckBoxSelected, setAllCheckBoxSelected] = useState(false);
    const fetchEmergencyBagsTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const [emergencyBagCountPerPage, setEmergencyBagCountPerPage] = useState(
        defaultNumberOfParcelsPerPage
    );
    const [currentPage, setCurrentPage] = useState(1);
    const startPoint = (currentPage - 1) * emergencyBagCountPerPage;
    const endPoint = currentPage * emergencyBagCountPerPage - 1;

    const emergencyBagsTableFetchAbortController = useRef<AbortController | null>(null);

    const fetchAndDisplayEmergencyBagsData = useCallback(async (): Promise<void> => {
        if (emergencyBagsTableFetchAbortController.current) {
            emergencyBagsTableFetchAbortController.current.abort("stale request");
        }

        emergencyBagsTableFetchAbortController.current = new AbortController();

        if (emergencyBagsTableFetchAbortController.current) {
            setErrorMessage(null);

            const { data, error } = await getEmergencyBagsTableDataAndAllIds(
                supabase,
                appliedFilters,
                sortState,
                emergencyBagsTableFetchAbortController.current.signal,
                startPoint,
                endPoint
            );

            if (error) {
                const newErrorMessage = getEmergencyBagDataErrorMessage(error.type);
                if (newErrorMessage !== null) {
                    setErrorMessage(`${newErrorMessage} Log ID: ${error.logId}`);
                }
            } else {
                setEmergencyBagsDataPortion(data.emergencyBagTableRows);
                setFilteredEmergencyBagCount(data.allEmergencyBagIds.length);
                setAllFilteredEmergencyBagIds(data.allEmergencyBagIds);

                if (sortState.sortEnabled && sortState.column.headerKey) {
                    setEmergencyBagRowBreakPointConfig(
                        searchForBreakPoints(sortState.column.headerKey, data.emergencyBagTableRows)
                    );
                } else {
                    // The user hasn't request a specific sort, so breakpoints are as per default sorting
                    setEmergencyBagRowBreakPointConfig(
                        searchForBreakPoints(
                            defaultEmergencyBagsSortConfig.defaultColumnHeaderKey as keyof EmergencyBagsTableRow,
                            data.emergencyBagTableRows
                        )
                    );
                }
            }

            emergencyBagsTableFetchAbortController.current = null;
            setIsLoading(false);
        }
    }, [appliedFilters, endPoint, sortState, startPoint, setErrorMessage]);

    useEffect(() => {
        if (!areFiltersLoadingForFirstTime) {
            void fetchAndDisplayEmergencyBagsData();
        }
    }, [areFiltersLoadingForFirstTime, fetchAndDisplayEmergencyBagsData]);

    const loadCountAndDataWithTimer = (table_name?: string): void => {
        if (fetchEmergencyBagsTimer.current) {
            clearTimeout(fetchEmergencyBagsTimer.current);
            fetchEmergencyBagsTimer.current = null;
        }
        if (table_name !== "events") {
            setIsLoading(true);
        }
        fetchEmergencyBagsTimer.current = setTimeout(() => {
            void fetchAndDisplayEmergencyBagsData();
        }, 500);
    };

    //TODO: subscribe to emergency bag changes
    useEffect(() => {
        const subscriptionChannel = supabase
            .channel("emergency-bags-table-changes")
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "emergency_bags" },
                () => loadCountAndDataWithTimer
            )
            .on("postgres_changes", { event: "*", schema: "public", table: "events" }, () =>
                loadCountAndDataWithTimer("events")
            )
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "collection_centres" },
                () => loadCountAndDataWithTimer
            )
            .subscribe((status, err) => {
                if (
                    subscriptionStatusRequiresErrorMessage(
                        status,
                        err,
                        "emergency bags and related"
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
    });

    const selectOrDeselectRow = (emergencyBagId: string): void => {
        const currentIndices = checkedEmergencyBagIds;
        if (currentIndices.includes(emergencyBagId)) {
            setCheckedEmergencyBagIds(
                currentIndices.filter(
                    (dummyEmergencyBagId) => dummyEmergencyBagId !== emergencyBagId
                )
            );
        } else {
            setCheckedEmergencyBagIds(currentIndices.concat([emergencyBagId]));
        }
    };

    const toggleAllCheckBox = async (): Promise<void> => {
        if (isAllCheckBoxSelected) {
            setCheckedEmergencyBagIds([]);
            setAllCheckBoxSelected(false);
        } else if (allFilteredEmergencyBagIds.length > 0) {
            setCheckedEmergencyBagIds(allFilteredEmergencyBagIds);
            setAllCheckBoxSelected(true);
        }
    };

    useEffect(() => {
        if (
            checkedEmergencyBagIds.some(
                (emergencyBagId) => !allFilteredEmergencyBagIds.includes(emergencyBagId)
            )
        ) {
            setCheckedEmergencyBagIds(
                allFilteredEmergencyBagIds.filter((emergencyBagId) =>
                    checkedEmergencyBagIds.includes(emergencyBagId)
                )
            );
        }
    }, [allFilteredEmergencyBagIds, checkedEmergencyBagIds, setCheckedEmergencyBagIds]);

    useEffect(() => {
        const allChecked =
            checkedEmergencyBagIds.length === filteredEmergencyBagCount &&
            filteredEmergencyBagCount > 0;
        if (allChecked !== isAllCheckBoxSelected) {
            setAllCheckBoxSelected(allChecked);
        }
    }, [filteredEmergencyBagCount, checkedEmergencyBagIds, isAllCheckBoxSelected]);

    const onEmergencyBagTableRowClick = (row: Row<EmergencyBagsTableRow>): void => {
        openEmergencyBagModal(row.data.emergencyBagId);
    };

    let emergencyBagTableColumnDisplayFunctions;
    let emergencyBagTableColumnStyleOptions;
    return (
        <TableSurface>
            <ServerPaginatedTable<
                EmergencyBagsTableRow,
                DbEmergencyBagRow,
                string | DateRangeState | string[]
            >
                dataPortion={emergencyBagsDataPortion}
                isLoading={isLoading}
                paginationConfig={{
                    enablePagination: true,
                    filteredCount: filteredEmergencyBagCount,
                    onPageChange: setCurrentPage,
                    onPerPageChange: setEmergencyBagCountPerPage,
                    defaultRowsPerPage: defaultNumberOfParcelsPerPage,
                    rowsPerPageOptions: numberOfParcelsPerPageOptions,
                }}
                headerKeysAndLabels={emergencyBagTableHeaderKeysAndLabels}
                columnDisplayFunctions={emergencyBagTableColumnDisplayFunctions}
                columnStyleOptions={emergencyBagTableColumnStyleOptions}
                onRowClick={onEmergencyBagTableRowClick}
                sortConfig={{
                    sortPossible: true,
                    sortableColumns: emergencyBagsSortableColumns,
                    setSortState: setSortState,
                }}
                defaultSortConfig={defaultEmergencyBagsSortConfig}
                rowBreakPointConfigs={emergencyBagRowBreakPointConfig}
                filterConfig={{
                    primaryFiltersShown: false,
                    additionalFiltersShown: false,
                }}
                defaultShownHeaders={emergencyBagTableDefaultShownHeaders}
                toggleableHeaders={emergencyBagTableToggleableHeaders}
                checkboxConfig={{
                    displayed: true,
                    selectedRowIds: checkedEmergencyBagIds,
                    isAllCheckboxChecked: isAllCheckBoxSelected,
                    onCheckboxClicked: (emergencyBagData) =>
                        selectOrDeselectRow(emergencyBagData.emergencyBagId),
                    onAllCheckboxClicked: () => toggleAllCheckBox(),
                    isRowChecked: (emergencyBagData) =>
                        checkedEmergencyBagIds.includes(emergencyBagData.emergencyBagId),
                }}
                editableConfig={{ editable: false }}
                pointerOnHover={true}
            />
        </TableSurface>
    );
};

export default EmergencyBagsTable;
