"use client";

import React, { useEffect, useState } from "react";
import supabase from "@/supabaseClient";
import { useSearchParams } from "next/navigation";
import { parseQueryParams } from "@/common/urlQueryParams";
import { returnPathQueryParam } from "@/common/constants";
import ClientForm, { ClientErrors } from "@/app/clients/form/ClientForm";
import { Errors } from "@/components/Form/formFunctions";
import autofill from "@/app/clients/edit/[id]/autofill";
import { fetchClient, fetchFamily } from "@/common/fetch";
import { Schema } from "@/databaseUtils";
import { ErrorSecondaryText } from "@/app/errorStylingandMessages";

interface EditClientsParameters {
    params: { id: string };
}

const EditClients: ({ params }: EditClientsParameters) => React.ReactElement = ({
    params,
}: EditClientsParameters) => {
    const searchParams = useSearchParams();

    const [clientData, setClientData] = useState<Schema["clients"] | null>(null);
    const [familyData, setFamilyData] = useState<Schema["families"][] | null>(null);
    const [error, setError] = useState<string | null>();
    const [returnPath, setReturnPath] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            if (!params.id) {
                return;
            }

            const urlQueryParams = parseQueryParams(searchParams.toString());
            if (urlQueryParams[returnPathQueryParam]) {
                setReturnPath(urlQueryParams[returnPathQueryParam] as string);
            }

            setError(null);
            const { data: clientData, error: clientError } = await fetchClient(params.id, supabase);
            if (clientError) {
                switch (clientError.type) {
                    case "clientFetchFailed":
                        setError(`Unable to fetch client data. Log ID: ${clientError.logId}`);
                        break;
                    case "noMatchingClients":
                        setError(
                            `No matching clients with client ID. Log ID: ${clientError.logId}`
                        );
                        break;
                }
                return;
            }
            setClientData(clientData);

            const { data: familyData, error: familyError } = await fetchFamily(
                clientData.family_id,
                supabase
            );
            if (familyError) {
                switch (familyError.type) {
                    case "familyFetchFailed":
                        setError(`Unable to fetch family data. Log ID: ${familyError.logId}`);
                }
                return;
            }
            setFamilyData(familyData);
        })();
    }, [params.id, searchParams]);

    const initialFields = clientData && familyData ? autofill(clientData, familyData) : null;

    const initialFormErrors: ClientErrors = {
        fullName: Errors.none,
        phoneNumber: Errors.none,
        additionalPhoneNumbers: [Errors.none],
        email: Errors.none,
        addressLine1: Errors.none,
        addressPostcode: Errors.none,
        numberOfAdults: Errors.none,
        numberOfChildren: Errors.none,
        listType: Errors.none,
        deliveryInstructions: Errors.none,
    };

    return (
        <main>
            {error ? (
                <ErrorSecondaryText>{error}</ErrorSecondaryText>
            ) : (
                initialFields && (
                    <ClientForm
                        initialFields={initialFields}
                        initialFormErrors={initialFormErrors}
                        editConfig={{ clientID: params.id, editMode: true }}
                        returnPath={returnPath}
                    />
                )
            )}
        </main>
    );
};

export default EditClients;
