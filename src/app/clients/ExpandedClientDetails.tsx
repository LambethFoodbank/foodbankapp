import { CircularProgress } from "@mui/material";
import React, { ChangeEvent, useCallback, useEffect, useState } from "react";
import styled from "styled-components";
import ClientParcelsTable from "@/app/clients/ClientParcelsTable";
import {
    ExpandedClientParcelDetails,
    getClientParcelsDetails,
} from "@/app/clients/getClientParcelsData";
import getExpandedClientDetails, {
    ExpandedClientData,
} from "@/app/clients/getExpandedClientDetails";
import { capitaliseWords } from "@/common/format";
import DataViewer, {
    convertDataToDataForDataViewer,
    DataForDataViewer,
} from "@/components/DataViewer/DataViewer";
import { Centerer } from "@/components/Modal/ModalFormStyles";
import { updateClientNotes } from "./updateClientNotes";
import { ErrorSecondaryText } from "../errorStylingandMessages";

interface Props {
    clientId: string;
    displayClientsParcels?: boolean;
}

const DeletedText = styled.div`
    font-weight: 600;
    padding: 0.5em 0 0 0;
    justify-content: center;
    display: flex;
    flex-direction: row;
`;

const ExpandedClientDetails: React.FC<Props> = ({ clientId, displayClientsParcels = false }) => {
    const [clientDetails, setClientDetails] = useState<ExpandedClientData | null>(null);
    const [clientParcelsDetails, setClientParcelsDetails] = useState<
        ExpandedClientParcelDetails[] | null
    >(null);

    const originalNotes = clientDetails?.notes ?? null;

    const [notes, setNotes] = useState<string | null>(originalNotes);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const loadData = useCallback(() => {
        (async () => {
            setIsLoading(true);
            setClientDetails(await getExpandedClientDetails(clientId));
            setClientParcelsDetails(
                displayClientsParcels ? await getClientParcelsDetails(clientId) : null
            );
            setIsLoading(false);
        })();
    }, [clientId, displayClientsParcels]);

    useEffect(loadData, [loadData]);

    const onSaveNotes = async (): Promise<void> => {
        setErrorMessage(null);
        const { error } = await updateClientNotes(clientId, notes, clientDetails?.lastUpdated);
        if (error) {
            setErrorMessage(`Error saving notes, please refresh the page. Log ID: ${error.logId}`);
            setNotes(originalNotes);
        } else {
            setNotes(notes);
            loadData();
        }
    };

    const onChangeNotes = async (event: ChangeEvent<HTMLInputElement>): Promise<void> => {
        setErrorMessage(null);
        setNotes(event.target.value);
    };

    const onCancelNotes = async (): Promise<void> => {
        setErrorMessage(null);
        const { error } = await updateClientNotes(
            clientId,
            originalNotes,
            clientDetails?.lastUpdated
        );
        if (error) {
            setErrorMessage(`Error saving notes, please refresh the page. Log ID: ${error.logId}`);
            setNotes(originalNotes);
        } else {
            loadData();
        }
    };

    const getExpandedClientDetailsForDataViewer = (
        clientDetails: ExpandedClientData
    ): DataForDataViewer => {
        const clientDetailsForDataViewer = convertDataToDataForDataViewer({
            ...clientDetails,
        });
        clientDetailsForDataViewer["notes"] = {
            value: clientDetails["notes"],
            editFunctions: {
                onChange: onChangeNotes,
                onCancel: onCancelNotes,
                onSave: onSaveNotes,
            },
        };
        clientDetailsForDataViewer["defaultList"] = {
            value: capitaliseWords(clientDetails["defaultList"]),
        };
        clientDetailsForDataViewer["isActive"] = {
            value: clientDetails["isActive"],
            hide: true,
        };
        return clientDetailsForDataViewer;
    };

    return isLoading ? (
        <Centerer>
            <CircularProgress />
        </Centerer>
    ) : (
        clientDetails && (
            <>
                {clientDetails.isActive ? (
                    <DataViewer
                        data={{ ...getExpandedClientDetailsForDataViewer(clientDetails) }}
                    />
                ) : (
                    <DeletedText>Client has been deleted.</DeletedText>
                )}
                <ErrorSecondaryText>{errorMessage}</ErrorSecondaryText>
                {clientParcelsDetails && displayClientsParcels && (
                    <ClientParcelsTable parcelsData={clientParcelsDetails} />
                )}
            </>
        )
    );
};

export default ExpandedClientDetails;
