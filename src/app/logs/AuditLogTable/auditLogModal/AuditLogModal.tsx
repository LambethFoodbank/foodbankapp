"use client";

import React, { useCallback, useEffect, useState } from "react";
import Modal from "@/components/Modal/Modal";
import styled from "styled-components";
import { AuditLogRow } from "../types";
import { capitaliseWords, formatJson } from "@/common/format";
import CollectionCentreAuditLogModalRow from "./auditLogModalRows/CollectionCentre";
import ParcelAuditLogModalRow from "./auditLogModalRows/Parcel";
import ClientAuditLogModalRow from "./auditLogModalRows/Client";
import ListsAuditLogModalRow from "./auditLogModalRows/Lists";
import EventAuditLogModalRow from "./auditLogModalRows/Event";
import ProfileAuditLogModalRow from "./auditLogModalRows/Profile";
import PackingSlotAuditLogModalRow from "./auditLogModalRows/PackingSlot";
import StatusOrderAuditLogModalRow from "./auditLogModalRows/StatusOrder";
import WebsiteDataAuditLogModalRow from "./auditLogModalRows/WebsiteData";
import { AuditLogModalItem, Key, TextValueContainer } from "./AuditLogModalRow";
import { getSingleAuditLogById } from "../fetchAuditLogData";
import supabase from "@/supabaseClient";

export const AuditLogModalContainer = styled.div`
    width: 800px;
    max-width: 100%;

    display: flex;
    flex-direction: column;
`;

interface AuditLogModalProps {
    modalIsOpen: boolean;
    selectedAuditLogRowId: string | null;
    closeAuditLogModal: () => void;
    refreshCallback?: (refreshFunction: () => void) => void;
}

const AuditLogModal: React.FC<AuditLogModalProps> = ({
    modalIsOpen,
    selectedAuditLogRowId,
    closeAuditLogModal,
    refreshCallback,
}) => {
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const [selectedAuditLogRow, setSelectedAuditLogRow] = useState<AuditLogRow | null>(null);

    const fetchAuditLogData = useCallback(async (): Promise<void> => {
        if (!selectedAuditLogRowId) {
            return;
        }

        const row = await getSingleAuditLogById(supabase, selectedAuditLogRowId);

        setSelectedAuditLogRow(row);
    }, [selectedAuditLogRowId]);

    useEffect(() => {
        void fetchAuditLogData();
    }, [fetchAuditLogData, modalIsOpen, selectedAuditLogRowId, refreshTrigger]);

    const refreshAuditLogDetails = (): void => {
        setRefreshTrigger((prev) => prev + 1);
    };

    useEffect(() => {
        if (refreshCallback) {
            refreshCallback(refreshAuditLogDetails);
        }
    }, [refreshCallback]);

    return (
        <>
            <Modal
                header={
                    <>
                        {selectedAuditLogRow?.action
                            ? capitaliseWords(selectedAuditLogRow?.action)
                            : ""}
                    </>
                }
                isOpen={modalIsOpen}
                onClose={closeAuditLogModal}
                headerId="auditLogModal"
            >
                {selectedAuditLogRow && (
                    <AuditLogModalContainer>
                        {selectedAuditLogRow.parcelId && (
                            <ParcelAuditLogModalRow parcelId={selectedAuditLogRow.parcelId} />
                        )}
                        {selectedAuditLogRow.clientId && (
                            <ClientAuditLogModalRow clientId={selectedAuditLogRow.clientId} />
                        )}
                        {selectedAuditLogRow.collectionCentreId && (
                            <CollectionCentreAuditLogModalRow
                                collectionCentreId={selectedAuditLogRow.collectionCentreId}
                            />
                        )}
                        {selectedAuditLogRow.eventId && (
                            <EventAuditLogModalRow eventId={selectedAuditLogRow.eventId} />
                        )}
                        {selectedAuditLogRow.profileId && (
                            <ProfileAuditLogModalRow profileId={selectedAuditLogRow.profileId} />
                        )}
                        {selectedAuditLogRow.listId && (
                            <ListsAuditLogModalRow listsId={selectedAuditLogRow.listId} />
                        )}
                        {selectedAuditLogRow.packingSlotId && (
                            <PackingSlotAuditLogModalRow
                                packingSlotId={selectedAuditLogRow.packingSlotId}
                            />
                        )}
                        {selectedAuditLogRow.statusOrder && (
                            <StatusOrderAuditLogModalRow
                                statusOrderEventName={selectedAuditLogRow.statusOrder}
                            />
                        )}
                        {selectedAuditLogRow.websiteData && (
                            <WebsiteDataAuditLogModalRow
                                websiteDataName={selectedAuditLogRow.websiteData}
                            />
                        )}
                        <AuditLogModalItem>
                            <Key>ACTION CONTENT: </Key>
                            <TextValueContainer>
                                {formatJson(selectedAuditLogRow.content)}
                            </TextValueContainer>
                        </AuditLogModalItem>
                    </AuditLogModalContainer>
                )}
            </Modal>
        </>
    );
};

export default AuditLogModal;
