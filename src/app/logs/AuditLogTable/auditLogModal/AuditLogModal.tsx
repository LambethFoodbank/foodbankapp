"use client";

import React, { useEffect, useRef, useState } from "react";
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
import { getAuditLogByIds } from "../fetchAuditLogData";
import { useTheme } from "styled-components";
import supabase from "@/supabaseClient";
import { generateReturnPathQueryParam } from "@/common/urlQueryParams";

export const AuditLogModalContainer = styled.div`
    width: 800px;
    max-width: 100%;

    display: flex;
    flex-direction: column;
`;

interface AuditLogModalProps {
    modalIsOpen: boolean;
    selectedAuditLogRow: AuditLogRow | null;
    closeAuditLogModal: () => void;
}

const AuditLogModal: React.FC<AuditLogModalProps> = ({ 
    modalIsOpen,
    selectedAuditLogRow,
    closeAuditLogModal,
}) => {
    const refreshAuditLogDetailsRef = useRef<(() => void)| null>(null);

    const theme = useTheme();

    // useEffect(() => {
    //     setReturnPathQueryParamForLinks(generateReturnPathQueryParam(window.location));
    // }, [modalIsOpen]);
    
    const refreshDetails = (): void => {
        if (refreshAuditLogDetailsRef.current) {
            refreshAuditLogDetailsRef.current();
        }
    };

    const postSetStatusCallback = (): void => {
        refreshDetails();
    };

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
            isOpen={selectedAuditLogRow !== null}
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
function setReturnPathQueryParamForLinks(arg0: string) {
    throw new Error("Function not implemented.");
}

