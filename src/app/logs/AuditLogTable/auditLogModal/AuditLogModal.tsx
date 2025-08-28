"use client";

import React from "react";
import Modal from "@/components/Modal/Modal";
import styled, { useTheme } from "styled-components";
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

export const AuditLogModalContainer = styled.div`
    width: 800px;
    max-width: 100%;

    display: flex;
    flex-direction: column;
`;

interface AuditLogModalProps {
    selectedAuditLogRow: AuditLogRow | null;
    onClose: () => void;
}

const AuditLogModal: React.FC<AuditLogModalProps> = ({ selectedAuditLogRow, onClose }) => {
    const theme = useTheme();

    return (
        <Modal
            header={
                <>
                    {selectedAuditLogRow?.action
                        ? capitaliseWords(selectedAuditLogRow?.action)
                        : ""}
                </>
            }
            isOpen={selectedAuditLogRow !== null}
            onClose={onClose}
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
    );
};

export default AuditLogModal;
