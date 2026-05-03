"use client";

import React, { useEffect, useState } from "react";
import ParcelForm, {
    initialParcelFields,
    initialParcelFormErrors,
} from "@/app/parcels/form/ParcelForm";
import {
    CollectionCentresLabelsAndValues,
    FetchClientError,
    FetchCollectionCentresError,
    PackingSlotsError,
    PackingSlotsLabelsAndValues,
    fetchClient,
    fetchPackingSlotsInfo,
    getActiveCollectionCentres,
} from "@/common/fetch";
import { LIST_TYPES_ARRAY, ListTypeLabelsAndValues } from "@/common/databaseListTypes";
import { ErrorSecondaryText } from "@/app/errorStylingandMessages";
import supabase from "@/supabaseClient";
import Title from "@/components/Title/Title";
import { insertParcel } from "@/app/parcels/form/submitFormHelpers";
import { capitaliseWords } from "@/common/format";
import { useSearchParams } from "next/navigation";
import { parseQueryParams } from "@/common/urlQueryParams";
import { returnPathQueryParam } from "@/common/constants";

interface AddParcelProps {
    clientId: string;
}

const getErrorMessage = (
    error: FetchCollectionCentresError | PackingSlotsError | FetchClientError
): string => {
    let errorMessage: string;
    switch (error.type) {
        case "collectionCentresFetchFailed":
            errorMessage = "Failed to fetch collection centres data. Please refresh the page.";
            break;
        case "packingSlotsFetchFailed":
            errorMessage = "Failed to fetch packing slots data. Please refresh the page.";
            break;
        case "clientFetchFailed":
            errorMessage = "Unable to fetch client data. Please refresh the page.";
            break;
        case "noMatchingClients":
            errorMessage = "No matching clients with client ID. Please refresh the page.";
            break;
    }
    return `${errorMessage} Log ID: ${error.logId}`;
};

const AddParcels = ({ clientId }: AddParcelProps): React.ReactElement => {
    const searchParams = useSearchParams();

    const [deliveryPrimaryKey, setDeliveryPrimaryKey] = useState<string | null>(null);
    const [collectionCentresLabelsAndValues, setCollectionCentresLabelsAndValues] =
        useState<CollectionCentresLabelsAndValues | null>(null);
    const [packingSlotsLabelsAndValues, setPackingSlotsLabelsAndValues] =
        useState<PackingSlotsLabelsAndValues | null>(null);
    const [listTypeLabelsAndValues, setListTypeLabelsAndValues] = useState<ListTypeLabelsAndValues>(
        []
    );
    const [error, setError] = useState<
        FetchCollectionCentresError | PackingSlotsError | FetchClientError | null
    >(null);
    const [isLoading, setIsLoading] = useState(true);
    const [returnPath, setReturnPath] = useState<string | null>(null);

    useEffect(() => {
        const urlQueryParams = parseQueryParams(searchParams.toString());
        if (urlQueryParams[returnPathQueryParam]) {
            setReturnPath(urlQueryParams[returnPathQueryParam] as string);
        }
    }, [searchParams]);

    useEffect(() => {
        (async () => {
            setIsLoading(true);

            const { data: collectionCentresData, error: collectionCentresError } =
                await getActiveCollectionCentres(supabase);
            if (collectionCentresError) {
                setError(collectionCentresError);
                setIsLoading(false);
                return;
            }
            setCollectionCentresLabelsAndValues(
                collectionCentresData.collectionCentresLabelsAndValues
            );
            setDeliveryPrimaryKey(collectionCentresData.deliveryPrimaryKey);

            const { data: packingSlotsData, error: packingSlotsError } =
                await fetchPackingSlotsInfo(supabase);
            if (packingSlotsError) {
                setError(packingSlotsError);
                setIsLoading(false);
                return;
            }
            setPackingSlotsLabelsAndValues(packingSlotsData);

            const { data: clientData, error: clientError } = await fetchClient(clientId, supabase);
            if (clientError) {
                setError(clientError);
                setIsLoading(false);
                return;
            }

            initialParcelFields.listType = clientData.default_list;
            initialParcelFields.deliveryInstructions = clientData.delivery_instructions;

            setListTypeLabelsAndValues(
                LIST_TYPES_ARRAY.map((listType) =>
                    clientData.default_list === listType
                        ? [capitaliseWords(listType) + " (default)", listType]
                        : [capitaliseWords(listType), listType]
                )
            );

            setIsLoading(false);
        })();
    }, [clientId]);

    return (
        <>
            <Title>Add Parcel</Title>
            {isLoading ? (
                <></>
            ) : error ? (
                <ErrorSecondaryText>{getErrorMessage(error)}</ErrorSecondaryText>
            ) : (
                deliveryPrimaryKey &&
                collectionCentresLabelsAndValues &&
                packingSlotsLabelsAndValues && (
                    <ParcelForm
                        initialFields={initialParcelFields}
                        initialFormErrors={initialParcelFormErrors}
                        clientId={clientId}
                        writeParcelInfoToDatabase={insertParcel}
                        deliveryPrimaryKey={deliveryPrimaryKey}
                        collectionCentresLabelsAndValues={collectionCentresLabelsAndValues}
                        packingSlotsLabelsAndValues={packingSlotsLabelsAndValues}
                        listTypeLabelsAndValues={listTypeLabelsAndValues}
                        returnPath={returnPath}
                    />
                )
            )}
        </>
    );
};

export default AddParcels;
