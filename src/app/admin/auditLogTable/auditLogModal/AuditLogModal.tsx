"use client";

import DietaryRequirementAuditLogModalRow from "@/app/admin/auditLogTable/auditLogModal/auditLogModalRows/DietaryRequirement";
import React from "react";
import Icon from "@/components/Icons/Icon";
import Modal from "@/components/Modal/Modal";
import styled, { useTheme } from "styled-components";
import { auditLogIcon } from "../../AdminPage";
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
                    <Icon icon={auditLogIcon} color={theme.primary.largeForeground[2]} />
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
                    {selectedAuditLogRow.dietaryRequirement && (
                        <DietaryRequirementAuditLogModalRow
                            dietaryRequirement={selectedAuditLogRow.dietaryRequirement}
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
