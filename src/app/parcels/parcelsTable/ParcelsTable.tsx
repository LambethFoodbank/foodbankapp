import { BreakPointConfig } from "@/components/Tables/Table";
import TableSurface from "@/components/Tables/TableSurface";
import { ParcelsFilter, ParcelsSortState, ParcelsTableRow } from "@/app/parcels/parcelsTable/types";
import { DbParcelRow } from "@/databaseUtils";
import { DateRangeState } from "@/components/DateInputs/DateRangeInputs";
import {
    defaultNumberOfParcelsPerPage,
    numberOfParcelsPerPageOptions,
} from "@/app/parcels/parcelsTable/constants";
import {
    parcelTableDefaultShownHeaders,
    parcelTableHeaderKeysAndLabels,
    parcelTableToggleableHeaders,
} from "@/app/parcels/parcelsTable/headers";
import {
    getParcelDataErrorMessage,
    parcelTableColumnDisplayFunctions,
} from "@/app/parcels/parcelsTable/format";
import { parcelTableColumnStyleOptions } from "@/app/parcels/parcelsTable/styles";
import parcelsSortableColumns, {
    defaultParcelsSortConfig,
} from "@/app/parcels/parcelsTable/sortableColumns";
import { useCallback, useEffect, useRef, useState } from "react";
import { getParcelsTableDataAndAllIds } from "@/app/parcels/parcelsTable/fetchParcelTableData";
import supabase from "@/supabaseClient";
import { searchForBreakPoints } from "@/app/parcels/parcelsTable/conditionalStyling";
import { subscriptionStatusRequiresErrorMessage } from "@/common/subscriptionStatusRequiresErrorMessage";
import { ServerPaginatedMaterialTable } from "@/components/Tables/MaterialTable";
import { MRT_Row } from "material-react-table";

interface ParcelsTableProps {
    checkedParcelIds: string[];
    setCheckedParcelIds: (ids: string[]) => void;
    openParcelModal: (parcelId: string) => void;
    sortState: ParcelsSortState;
    setSortState: (sortState: ParcelsSortState) => void;
    appliedFilters: (
        | ParcelsFilter<string>
        | ParcelsFilter<DateRangeState>
        | ParcelsFilter<string[]>
    )[];
    areFiltersLoadingForFirstTime: boolean;
    setErrorMessage: (errorMessage: string | null) => void;
}

const ParcelsTable: React.FC<ParcelsTableProps> = ({
    checkedParcelIds,
    setCheckedParcelIds,
    openParcelModal,
    sortState,
    setSortState,
    appliedFilters,
    areFiltersLoadingForFirstTime,
    setErrorMessage,
}) => {
    const [isLoading, setIsLoading] = useState(true);
    const [parcelsDataPortion, setParcelsDataPortion] = useState<ParcelsTableRow[]>([]);
    const [filteredParcelCount, setFilteredParcelCount] = useState<number>(0);
    const [allFilteredParcelIds, setAllFilteredParcelIds] = useState<string[]>([]);

    const [parcelRowBreakPointConfig, setParcelRowBreakPointConfig] = useState<BreakPointConfig[]>(
        []
    );

    const [isAllCheckBoxSelected, setAllCheckBoxSelected] = useState(false);
    const fetchParcelsTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const [parcelCountPerPage, setParcelCountPerPage] = useState(defaultNumberOfParcelsPerPage);
    const [currentPage, setCurrentPage] = useState(0);
    const startPoint = currentPage * parcelCountPerPage;
    const endPoint = startPoint + parcelCountPerPage - 1;

    const parcelsTableFetchAbortController = useRef<AbortController | null>(null);
    const latestFetchRequestId = useRef<number>(0);

    const fetchAndDisplayParcelsData = useCallback(async (): Promise<void> => {
        latestFetchRequestId.current += 1;
        const currentFetchRequestId = latestFetchRequestId.current;

        if (parcelsTableFetchAbortController.current) {
            parcelsTableFetchAbortController.current.abort("stale request");
        }
        parcelsTableFetchAbortController.current = new AbortController();

        setErrorMessage(null);
        const { data, error } = await getParcelsTableDataAndAllIds(
            supabase,
            appliedFilters,
            sortState,
            parcelsTableFetchAbortController.current.signal,
            startPoint,
            endPoint
        );

        if (currentFetchRequestId === latestFetchRequestId.current) {
            if (error) {
                const newErrorMessage = getParcelDataErrorMessage(error.type);
                if (newErrorMessage !== null) {
                    setErrorMessage(`${newErrorMessage} Log ID: ${error.logId}`);
                }
            } else {
                setParcelsDataPortion(data.parcelTableRows);
                setFilteredParcelCount(data.allParcelIds.length);
                setAllFilteredParcelIds(data.allParcelIds);

                if (sortState.sortEnabled && sortState.column.headerKey) {
                    setParcelRowBreakPointConfig(
                        searchForBreakPoints(sortState.column.headerKey, data.parcelTableRows)
                    );
                } else {
                    // The user hasn't request a specific sort, so breakpoints are as per default sorting
                    setParcelRowBreakPointConfig(
                        searchForBreakPoints(
                            defaultParcelsSortConfig.defaultColumnHeaderKey as keyof ParcelsTableRow,
                            data.parcelTableRows
                        )
                    );
                }
            }
        }

        parcelsTableFetchAbortController.current = null;
        setIsLoading(false);
    }, [appliedFilters, endPoint, sortState, startPoint, setErrorMessage]);

    useEffect(() => {
        if (!areFiltersLoadingForFirstTime) {
            void fetchAndDisplayParcelsData();
        }
    }, [areFiltersLoadingForFirstTime, fetchAndDisplayParcelsData]);

    const loadCountAndDataWithTimer = (table_name?: string): void => {
        if (fetchParcelsTimer.current) {
            clearTimeout(fetchParcelsTimer.current);
            fetchParcelsTimer.current = null;
        }
        if (table_name !== "events") {
            setIsLoading(true);
        }
        fetchParcelsTimer.current = setTimeout(() => {
            void fetchAndDisplayParcelsData();
        }, 500);
    };

    useEffect(() => {
        const subscriptionChannel = supabase
            .channel("parcels-table-changes")
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "parcels" },
                () => loadCountAndDataWithTimer
            )
            .on("postgres_changes", { event: "*", schema: "public", table: "events" }, () =>
                loadCountAndDataWithTimer("events")
            )
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "families" },
                () => loadCountAndDataWithTimer
            )
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "collection_centres" },
                () => loadCountAndDataWithTimer
            )
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "clients" },
                () => loadCountAndDataWithTimer
            )
            .subscribe((status, err) => {
                if (subscriptionStatusRequiresErrorMessage(status, err, "parcels and related")) {
                    setErrorMessage("Error fetching data, please reload");
                } else {
                    setErrorMessage(null);
                }
            });

        return () => {
            void supabase.removeChannel(subscriptionChannel);
        };
    });

    const selectOrDeselectRow = (parcelId: string): void => {
        const currentIndices = checkedParcelIds;
        if (currentIndices.includes(parcelId)) {
            setCheckedParcelIds(
                currentIndices.filter((dummyParcelId) => dummyParcelId !== parcelId)
            );
        } else {
            setCheckedParcelIds(currentIndices.concat([parcelId]));
        }
    };

    const toggleAllCheckBox = async (): Promise<void> => {
        if (isAllCheckBoxSelected) {
            setCheckedParcelIds([]);
            setAllCheckBoxSelected(false);
        } else if (allFilteredParcelIds.length > 0) {
            setCheckedParcelIds(allFilteredParcelIds);
            setAllCheckBoxSelected(true);
        }
    };

    useEffect(() => {
        if (checkedParcelIds.some((parcelId) => !allFilteredParcelIds.includes(parcelId))) {
            setCheckedParcelIds(
                allFilteredParcelIds.filter((parcelId) => checkedParcelIds.includes(parcelId))
            );
        }
    }, [allFilteredParcelIds, checkedParcelIds, setCheckedParcelIds]);

    useEffect(() => {
        const allChecked =
            checkedParcelIds.length === filteredParcelCount && filteredParcelCount > 0;
        if (allChecked !== isAllCheckBoxSelected) {
            setAllCheckBoxSelected(allChecked);
        }
    }, [filteredParcelCount, checkedParcelIds, isAllCheckBoxSelected]);

    const onParcelTableRowClick = (row: MRT_Row<ParcelsTableRow>): void => {
        openParcelModal(row.original.parcelId);
    };

    return (
        <TableSurface>
            <ServerPaginatedMaterialTable<
                ParcelsTableRow,
                DbParcelRow,
                string | DateRangeState | string[]
            >
                data={parcelsDataPortion}
                testId="ParcelsTable"
                setData={setParcelsDataPortion}
                headerKeysAndLabels={parcelTableHeaderKeysAndLabels}
                defaultShownHeaders={parcelTableDefaultShownHeaders}
                toggleableHeaders={parcelTableToggleableHeaders}
                columnDisplayFunctions={parcelTableColumnDisplayFunctions}
                isLoading={isLoading}
                enableRowOrdering={true}
                paginationConfig={{
                    enablePagination: true,
                    filteredCount: filteredParcelCount,
                    onPageChange: setCurrentPage,
                    onPerPageChange: setParcelCountPerPage,
                    defaultRowsPerPage: defaultNumberOfParcelsPerPage,
                    rowsPerPageOptions: numberOfParcelsPerPageOptions,
                }}
                sortConfig={{
                    sortPossible: true,
                    sortableColumns: parcelsSortableColumns,
                    setSortState: setSortState,
                }}
                defaultSortConfig={defaultParcelsSortConfig}
                filterConfig={{
                    primaryFiltersShown: false,
                    additionalFiltersShown: false,
                }}
                onRowClick={onParcelTableRowClick}
                checkboxConfig={{
                    displayed: true,
                    selectedRowIds: checkedParcelIds,
                    isAllCheckboxChecked: isAllCheckBoxSelected,
                    onCheckboxClicked: (parcelData) => selectOrDeselectRow(parcelData.parcelId),
                    onAllCheckboxClicked: () => toggleAllCheckBox(),
                    isRowChecked: (parcelData) => checkedParcelIds.includes(parcelData.parcelId),
                }}
                columnStyleOptions={parcelTableColumnStyleOptions}
            />
        </TableSurface>
    );
};

export default ParcelsTable;
