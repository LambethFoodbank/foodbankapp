"use client";

import { useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { ErrorSecondaryText } from "@/app/errorStylingandMessages";
import { updateParcel } from "@/app/parcels/form/submitFormHelpers";
import { returnPathQueryParam } from "@/common/constants";
import { LIST_TYPES_ARRAY, ListTypeLabelsAndValues } from "@/common/databaseListTypes";
import {
    CollectionCentresLabelsAndValues,
    fetchClient,
    FetchClientError,
    FetchCollectionCentresError,
    fetchPackingSlotsInfo,
    fetchParcel,
    FetchParcelError,
    getActiveCollectionCentres,
    PackingSlotsError,
    PackingSlotsLabelsAndValues,
    ParcelWithCollectionCentreAndPackingSlot,
} from "@/common/fetch";
import { arrayToBooleanGroup, capitaliseWords, formatDatetimeAsTime } from "@/common/format";
import { parseQueryParams } from "@/common/urlQueryParams";
import { Errors } from "@/components/Form/formFunctions";
import Title from "@/components/Title/Title";
import supabase from "@/supabaseClient";
import ParcelForm, { initialParcelFields, ParcelErrors, ParcelFields } from "../form/ParcelForm";

interface EditParcelFormProps {
    parcelId: string;
}

const prepareParcelDataForForm = (
    parcelData: ParcelWithCollectionCentreAndPackingSlot,
    deliveryPrimaryKey: string
): ParcelFields => {
    return {
        clientId: parcelData.client_id,
        listType: parcelData.list_type,
        voucherNumber: parcelData.voucher_number ?? "",
        packingDate: parcelData.packing_date,
        packingSlot: parcelData.packing_slot?.primary_key,
        shippingMethod:
            parcelData.collection_centre?.primary_key == deliveryPrimaryKey
                ? "Delivery"
                : "Collection",
        collectionDate: parcelData.collection_datetime,
        collectionSlot: formatDatetimeAsTime(parcelData.collection_datetime),
        collectionCentre: parcelData.collection_centre?.primary_key ?? null,
        lastUpdated: parcelData.last_updated,
        deliveryInstructions:
            parcelData.clientWithDeliveryInstructions?.delivery_instructions ?? null,
        notes: parcelData.notes,
        attentionFlag: parcelData.flagged_for_attention ?? false,
        referralAgency: parcelData.referral_agency ?? "",
        referrerName: parcelData.referrer_name ?? "",
        referrerEmail: parcelData.referrer_email ?? "",
        referrerPhone: parcelData.referrer_phone ?? "",
        signpostingCall: parcelData.signposting_call_required ?? false,
        signpostingCallReasons:
            parcelData.signposting_call_reasons !== null
                ? arrayToBooleanGroup(parcelData.signposting_call_reasons)
                : null,
        extraInformation: parcelData.extra_information ?? "",
    };
};

const getErrorMessage = (
    error: FetchCollectionCentresError | PackingSlotsError | FetchParcelError | FetchClientError
): string => {
    let errorMessage: string;
    switch (error.type) {
        case "collectionCentresFetchFailed":
            errorMessage = "Failed to fetch collection centres data.";
            break;
        case "packingSlotsFetchFailed":
            errorMessage = "Failed to fetch packing slots data.";
            break;
        case "failedToFetchParcel":
            errorMessage = "Failed to fetch parcel data.";
            break;
        case "noMatchingParcels":
            errorMessage = "No parcel in the database matches the selected parcel.";
            break;
        case "clientFetchFailed":
            errorMessage = "Unable to fetch client data. Please refresh the page.";
            break;
        case "noMatchingClients":
            errorMessage = "No matching clients with client ID. Please refresh the page.";
            break;
    }
    return `${errorMessage} Log Id: ${error.logId}`;
};

const EditParcelForm = ({ parcelId }: EditParcelFormProps): React.ReactElement<any> => {
    const searchParams = useSearchParams();

    const [isLoading, setIsLoading] = useState(true);
    const [initialFormFields, setInitialFormFields] = useState<ParcelFields>(initialParcelFields);
    const [deliveryKey, setDeliveryKey] = useState("");
    const [collectionCentres, setCollectionCentres] = useState<CollectionCentresLabelsAndValues>(
        []
    );
    const [listTypeLabelsAndValues, setListTypeLabelsAndValues] = useState<ListTypeLabelsAndValues>(
        []
    );
    const [packingSlots, setPackingSlots] = useState<PackingSlotsLabelsAndValues>([]);
    const [packingSlotIsShown, setPackingSlotsIsShown] = useState<boolean | undefined>(true);
    const [collectionCentreIsShown, setCollectionCentreIsShown] = useState<boolean>(true);
    const [error, setError] = useState<
        FetchCollectionCentresError | PackingSlotsError | FetchParcelError | FetchClientError | null
    >(null);
    const [returnPath, setReturnPath] = useState<string | null>(null);

    useEffect(() => {
        const urlQueryParams = parseQueryParams(searchParams.toString());
        if (urlQueryParams[returnPathQueryParam]) {
            setReturnPath(urlQueryParams[returnPathQueryParam] as string);
        }
    }, [searchParams]);

    useEffect(() => {
        (async () => {
            if (!initialFormFields.clientId) {
                setListTypeLabelsAndValues(
                    LIST_TYPES_ARRAY.map((listType) => [capitaliseWords(listType), listType])
                );
            } else {
                const { data: clientData, error: clientError } = await fetchClient(
                    initialFormFields.clientId,
                    supabase
                );
                if (clientError) {
                    setError(clientError);
                    setIsLoading(false);
                    return;
                }
                setListTypeLabelsAndValues(
                    LIST_TYPES_ARRAY.map((listType) =>
                        clientData.default_list === listType
                            ? [capitaliseWords(listType) + " (default)", listType]
                            : [capitaliseWords(listType), listType]
                    )
                );
            }
        })();
    }, [initialFormFields.clientId]);

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
            setDeliveryKey(collectionCentresData.deliveryPrimaryKey);
            setCollectionCentres(collectionCentresData.collectionCentresLabelsAndValues);

            const { data: packingSlotsData, error: packingSlotsError } =
                await fetchPackingSlotsInfo(supabase);
            if (packingSlotsError) {
                setError(packingSlotsError);
                setIsLoading(false);
                return;
            }
            setPackingSlots(packingSlotsData);

            const { data: parcelData, error: parcelError } = await fetchParcel(parcelId, supabase);
            if (parcelError) {
                setError(parcelError);
                setIsLoading(false);
                return;
            }
            setInitialFormFields(
                prepareParcelDataForForm(parcelData, collectionCentresData.deliveryPrimaryKey)
            );
            setPackingSlotsIsShown(parcelData.packing_slot?.is_shown);
            setCollectionCentreIsShown(parcelData.collection_centre?.is_shown === true);

            setIsLoading(false);
        })();
    }, [parcelId]);

    const initialFormErrors: ParcelErrors = {
        listType: Errors.none,
        voucherNumber: Errors.none,
        packingDate: Errors.none,
        packingSlot: packingSlotIsShown ? Errors.none : Errors.invalidPackingSlot,
        shippingMethod: Errors.none,
        collectionDate: Errors.none,
        collectionSlot: Errors.none,
        collectionCentre: collectionCentreIsShown ? Errors.none : Errors.invalidCollectionCentre,
        deliveryInstructions: Errors.none,
        referrerEmail: Errors.none,
        referrerPhone: Errors.none,
    };

    return (
        <>
            <Title>Edit Parcel</Title>
            {isLoading ? (
                <></>
            ) : error ? (
                <ErrorSecondaryText>{getErrorMessage(error)}</ErrorSecondaryText>
            ) : (
                <ParcelForm
                    initialFields={initialFormFields}
                    initialFormErrors={initialFormErrors}
                    writeParcelInfoToDatabase={updateParcel(parcelId)}
                    deliveryPrimaryKey={deliveryKey}
                    collectionCentresLabelsAndValues={collectionCentres}
                    packingSlotsLabelsAndValues={packingSlots}
                    listTypeLabelsAndValues={listTypeLabelsAndValues}
                    returnPath={returnPath}
                />
            )}
        </>
    );
};

export default EditParcelForm;
