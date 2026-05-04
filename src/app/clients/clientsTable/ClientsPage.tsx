"use client";

import LinkButton from "@/components/Buttons/LinkButton";
import Icon from "@/components/Icons/Icon";
import Modal from "@/components/Modal/Modal";
import { ButtonsDiv, Centerer, ContentDiv, OutsideDiv } from "@/components/Modal/ModalFormStyles";
import TableSurface from "@/components/Tables/TableSurface";
import supabase from "@/supabaseClient";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import React, { useEffect, useState, Suspense, useRef, useCallback, useContext } from "react";
import { useTheme } from "styled-components";
import getClientsDataAndCount from "./getClientsData";
import { useSearchParams, useRouter } from "next/navigation";
import ExpandedClientDetails from "@/app/clients/ExpandedClientDetails";
import ExpandedClientDetailsFallback from "@/app/clients/ExpandedClientDetailsFallback";
import { CircularProgress } from "@mui/material";
import { ErrorSecondaryText } from "../../errorStylingandMessages";
import { subscriptionStatusRequiresErrorMessage } from "@/common/subscriptionStatusRequiresErrorMessage";
import DeleteConfirmationDialog from "@/components/Modal/DeleteConfirmationDialog";
import DeleteButton from "@/components/Buttons/DeleteButton";
import deleteClient from "../deleteClient";
import { getIsClientActive } from "../getExpandedClientDetails";
import clientsFilters from "./filters";
import clientsSortableColumns from "./sortableColumns";
import clientsHeaders from "./headers";
import { ClientsTableRow, ClientsSortState, ClientsFilter } from "./types";
import { DbClientRow } from "@/databaseUtils";
import { clientIdParam } from "./constants";
import { getIsClientActiveErrorMessage, getDeleteClientErrorMessage } from "./format";
import { getClientParcelsDetails } from "../getClientParcelsData";
import { saveParcelStatus } from "@/app/parcels/ActionBar/saveStatus";
import { ConfirmButtons } from "@/components/Buttons/GeneralButtonParts";
import FloatingToast from "@/components/FloatingToast";
import { RoleUpdateContext, roleCanAccessOutsideDeliveryAreaModal } from "@/app/roles";
import { rowToAddressColumn } from "@/components/Tables/AddressColumnFormatter";
import { ServerPaginatedMaterialTable } from "@/components/Tables/MaterialTable";
import { MRT_Row } from "material-react-table";

const errorMessageForOutsideDeliveryArea = "The client clicked is outside the delivery area.";

const ClientsPage: React.FC = () => {
    const [isLoadingForFirstTime, setIsLoadingForFirstTime] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [clientsDataPortion, setClientsDataPortion] = useState<ClientsTableRow[]>([]);
    const [filteredClientCount, setFilteredClientCount] = useState<number>(0);
    const [sortState, setSortState] = useState<ClientsSortState>({ sortEnabled: false });
    const [primaryFilters, setPrimaryFilters] = useState<ClientsFilter[]>(clientsFilters);
    const [fetchErrorMessage, setFetchErrorMessage] = useState<string | null>(null);
    const [rowClickErrorMessage, setRowClickErrorMessage] = useState<string | null>(null);
    const [isSelectedClientActive, setIsSelectedClientActive] = useState<boolean | null>(null);
    const [isClientActiveErrorMessage, setIsClientActiveErrorMessage] = useState<string | null>(
        null
    );
    const [deleteClientErrorMessage, setDeleteClientErrorMessage] = useState<string | null>(null);
    const [isDeleteClientDialogOpen, setIsDeleteClientDialogOpen] = useState<boolean>(false);
    const clientTableFetchAbortController = useRef<AbortController | null>(null);
    const latestFetchRequestId = useRef<number>(0);

    const [perPage, setPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(0);
    const startPoint = currentPage * perPage;
    const endPoint = startPoint + perPage - 1;

    const fetchAndDisplayClientsData = useCallback(async () => {
        setIsLoading(true);

        latestFetchRequestId.current += 1;
        const currentFetchRequestId = latestFetchRequestId.current;

        if (clientTableFetchAbortController.current) {
            clientTableFetchAbortController.current.abort("stale request");
        }
        clientTableFetchAbortController.current = new AbortController();

        setFetchErrorMessage(null);
        const { data, error } = await getClientsDataAndCount(
            supabase,
            startPoint,
            endPoint,
            primaryFilters,
            sortState,
            clientTableFetchAbortController.current.signal
        );

        if (currentFetchRequestId === latestFetchRequestId.current) {
            if (error) {
                switch (error.type) {
                    case "abortedFetchingClientsTable":
                    case "abortedFetchingClientsTableCount":
                        return;
                    case "failedToFetchClientsTable":
                    case "failedToFetchClientsTableCount":
                        setFetchErrorMessage(`Error occurred: ${error.type}, Log ID:
                    ${error.logId}`);
                        break;
                }
            } else {
                setClientsDataPortion(data.clientData);
                setFilteredClientCount(data.count);
            }
        }

        clientTableFetchAbortController.current = null;
        setIsLoading(false);
        setIsLoadingForFirstTime(false);
    }, [startPoint, endPoint, primaryFilters, sortState]);

    useEffect(() => {
        void fetchAndDisplayClientsData();
    }, [fetchAndDisplayClientsData]);

    useEffect(() => {
        const subscriptionChannel = supabase
            .channel("clients-table-changes")
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "clients" },
                fetchAndDisplayClientsData
            )
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "collection_centres" },
                fetchAndDisplayClientsData
            )
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "families" },
                fetchAndDisplayClientsData
            )
            .subscribe((status, err) => {
                if (subscriptionStatusRequiresErrorMessage(status, err, "clients and related")) {
                    setFetchErrorMessage("Error fetching data, please reload");
                } else {
                    setFetchErrorMessage(null);
                }
            });

        return () => {
            void supabase.removeChannel(subscriptionChannel);
        };
    }, [startPoint, endPoint, primaryFilters, sortState, fetchAndDisplayClientsData]);

    const theme = useTheme();
    const router = useRouter();

    const searchParams = useSearchParams();
    const clientId = searchParams.get(clientIdParam);

    useEffect(() => {
        (async () => {
            setIsClientActiveErrorMessage(null);
            if (clientId) {
                const { isActive, error } = await getIsClientActive(clientId);
                if (error) {
                    setIsClientActiveErrorMessage(getIsClientActiveErrorMessage(error));
                    return;
                }
                setIsSelectedClientActive(isActive);
            }
        })();
    }, [clientId]);

    const onDeleteClient = async (): Promise<void> => {
        if (clientId) {
            const deletedClientsParcels = await getClientParcelsDetails(clientId);
            const { error: deleteClientParcelError } = await saveParcelStatus(
                deletedClientsParcels.map((parcel) => parcel.parcelId),
                "Parcel Deleted"
            );
            if (deleteClientParcelError) {
                setDeleteClientErrorMessage(getDeleteClientErrorMessage(deleteClientParcelError));
                return;
            }
            const { error: deleteClientError } = await deleteClient(clientId);
            setIsDeleteClientDialogOpen(false);
            if (deleteClientError) {
                setDeleteClientErrorMessage(getDeleteClientErrorMessage(deleteClientError));
                return;
            }
            setDeleteClientErrorMessage(null);
            router.push("/clients");
        }
    };

    const { role } = useContext(RoleUpdateContext);

    const onRowClick = (row: MRT_Row<ClientsTableRow>): void => {
        if (
            roleCanAccessOutsideDeliveryAreaModal(role, row.original.addressPostcode.isDeliverable)
        ) {
            setRowClickErrorMessage(null);
            router.push(`/clients?${clientIdParam}=${row.original.clientId}`);
        } else {
            setRowClickErrorMessage(errorMessageForOutsideDeliveryArea);
        }
    };

    return (
        <>
            {isLoadingForFirstTime ? (
                <Centerer>
                    <CircularProgress aria-label="table-initial-progress-bar" />
                </Centerer>
            ) : (
                <>
                    {(rowClickErrorMessage && (
                        <FloatingToast
                            message={rowClickErrorMessage}
                            severity="warning"
                            variant="filled"
                        ></FloatingToast>
                    )) ||
                        (fetchErrorMessage && (
                            <FloatingToast
                                message={fetchErrorMessage}
                                severity="warning"
                                variant="filled"
                            ></FloatingToast>
                        ))}
                    <Centerer>
                        <LinkButton link="/clients/add">Add Client</LinkButton>
                    </Centerer>
                    <TableSurface>
                        <ServerPaginatedMaterialTable<ClientsTableRow, DbClientRow, string>
                            data={clientsDataPortion}
                            setData={setClientsDataPortion}
                            isLoading={isLoading}
                            headerKeysAndLabels={clientsHeaders}
                            checkboxConfig={{ displayed: false }}
                            paginationConfig={{
                                enablePagination: true,
                                filteredCount: filteredClientCount,
                                onPageChange: setCurrentPage,
                                onPerPageChange: setPerPage,
                            }}
                            sortConfig={{
                                sortPossible: true,
                                sortableColumns: clientsSortableColumns,
                                setSortState: setSortState,
                            }}
                            onRowClick={onRowClick}
                            filterConfig={{
                                primaryFiltersShown: true,
                                primaryFilters: primaryFilters,
                                setPrimaryFilters: setPrimaryFilters,
                                additionalFiltersShown: false,
                            }}
                            columnDisplayFunctions={{ addressPostcode: rowToAddressColumn }}
                            rowActionsConfig={{ editable: false }}
                        />
                    </TableSurface>

                    <Modal
                        header={
                            <>
                                <Icon icon={faUser} color={theme.primary.largeForeground[2]} />
                                Client Details
                            </>
                        }
                        isOpen={clientId !== null}
                        onClose={() => {
                            router.push("/clients");
                        }}
                        headerId="clientsDetailModal"
                        footer={
                            isSelectedClientActive && (
                                <Centerer>
                                    <ConfirmButtons>
                                        <LinkButton link={`/clients/edit/${clientId}`}>
                                            Edit Client
                                        </LinkButton>
                                        <LinkButton link={`/parcels/add/${clientId}`}>
                                            Add Parcel
                                        </LinkButton>
                                        <DeleteButton
                                            onClick={() => setIsDeleteClientDialogOpen(true)}
                                        >
                                            Delete Client
                                        </DeleteButton>
                                    </ConfirmButtons>
                                </Centerer>
                            )
                        }
                    >
                        <OutsideDiv>
                            <ContentDiv>
                                {clientId && (
                                    <Suspense fallback={<ExpandedClientDetailsFallback />}>
                                        <ExpandedClientDetails
                                            clientId={clientId}
                                            displayClientsParcels
                                        />
                                    </Suspense>
                                )}
                            </ContentDiv>

                            <ButtonsDiv>
                                {isClientActiveErrorMessage && (
                                    <ErrorSecondaryText>
                                        {isClientActiveErrorMessage}
                                    </ErrorSecondaryText>
                                )}
                                {deleteClientErrorMessage && (
                                    <ErrorSecondaryText>
                                        {deleteClientErrorMessage}
                                    </ErrorSecondaryText>
                                )}
                            </ButtonsDiv>
                        </OutsideDiv>
                    </Modal>
                    <DeleteConfirmationDialog
                        isOpen={isDeleteClientDialogOpen}
                        closeModal={() => setIsDeleteClientDialogOpen(false)}
                        onConfirm={onDeleteClient}
                        deletionText="You are about to delete this client. This action cannot be undone."
                    />
                </>
            )}
        </>
    );
};

export default ClientsPage;
