"use client";

import FloatingToast from "@/components/FloatingToast";
import { Schema } from "@/databaseUtils";
import React, { useCallback, useEffect, useState } from "react";
import supabase from "@/supabaseClient";
import { fetchDiets, fetchLists } from "@/common/fetch";
import { useRouter } from "next/navigation";
import { returnPathQueryParam } from "@/common/constants";
import { stringifyQueryParams } from "@/common/urlQueryParams";
import { BooleanGroup } from "@/components/DataInput/inputHandlerFactories";
import {
    CardProps,
    checkErrorOnSubmit,
    Errors,
    Fields,
    FormErrors,
    Person,
    createSetter,
    Setter,
    Diet,
    Item,
} from "@/components/Form/formFunctions";
import {
    CenterComponent,
    FormErrorText,
    FormText,
    StyledForm,
} from "@/components/Form/formStyling";
import FullNameCard from "@/app/clients/form/formSections/FullNameCard";
import PhoneNumberCard from "@/app/clients/form/formSections/PhoneNumberCard";
import AddressCard from "@/app/clients/form/formSections/AddressCard";
import NumberAdultsCard from "@/app/clients/form/formSections/NumberAdultsCard";
import NumberChildrenCard from "@/app/clients/form/formSections/NumberChildrenCard";
import DietaryRequirementCard from "@/app/clients/form/formSections/DietaryRequirementCard";
import DietsCard from "@/app/clients/form/formSections/DietsCard";
import PreferredItemsCard from "@/app/clients/form/formSections/PreferredItemsCard";
import HygieneProductsCard from "@/app/clients/form/formSections/HygieneProductsCard";
import BabyProductsCard from "@/app/clients/form/formSections/BabyProductsCard";
import PetFoodCard from "@/app/clients/form/formSections/PetFoodCard";
import OtherItemsCard from "@/app/clients/form/formSections/OtherItemsCard";
import DeliveryInstructionsCard from "@/app/clients/form/formSections/DeliveryInstructionsCard";
import ExtraInformationCard from "@/app/clients/form/formSections/ExtraInformationCard";
import AttentionFlagCard from "@/app/clients/form/formSections/AttentionFlagCard";
import SignpostingCallCard from "@/app/clients/form/formSections/SignpostingCallCard";
import Button from "@mui/material/Button";
import { submitAddClientForm, submitEditClientForm } from "@/app/clients/form/submitFormHelpers";
import Title from "@/components/Title/Title";
import ClientNotesCard from "@/app/clients/form/formSections/ClientNotes";
import ListTypeCard from "@/app/clients/form/formSections/ListTypeCard";
import { ListType } from "@/common/databaseListTypes";
import CookingFacilitiesCard from "./formSections/CookingFacilitiesCard";
import EmailCard from "@/app/clients/form/formSections/EmailCard";

interface Props {
    initialFields: ClientFields;
    initialFormErrors: ClientErrors;
    editConfig: EditConfig;
    returnPath?: string | null;
}

type EditConfig = { editMode: true; clientID: string } | { editMode: false };

export interface ClientFields extends Fields {
    fullName: string;
    email: string;
    phoneNumber: string | null;
    addressLine1: string;
    addressLine2: string;
    addressTown: string;
    addressCounty: string;
    addressPostcode: string | null;
    adults: Person[];
    numberOfAdults: number;
    children: Person[];
    numberOfChildren: number;
    listType: ListType | null;
    cookingFacilities: BooleanGroup | null;
    dietaryRequirements: BooleanGroup | null;
    diets: Diet[];
    preferredItems: Item[];
    hygieneProducts: Item[];
    babyProducts: Item[];
    petFood: BooleanGroup;
    otherItems: Item[];
    deliveryInstructions: string;
    extraInformation: string;
    attentionFlag: boolean;
    signpostingCall: boolean;
    signpostingCallReasons: BooleanGroup | null;
    lastUpdated: string | undefined;
    notes: string | null;
}

export interface ClientErrors extends FormErrors<ClientFields> {
    fullName: Errors;
    phoneNumber: Errors;
    email: Errors;
    addressLine1: Errors;
    addressPostcode: Errors;
    numberOfAdults: Errors;
    numberOfChildren: Errors;
    listType: Errors;
    deliveryInstructions: Errors;
}

export type ClientSetter = Setter<ClientFields>;
export type ClientErrorSetter = Setter<ClientErrors>;
export type ClientCardProps = CardProps<ClientFields, ClientErrors>;

const formSections = [
    FullNameCard,
    PhoneNumberCard,
    EmailCard,
    AddressCard,
    NumberAdultsCard,
    NumberChildrenCard,
    ListTypeCard,
    CookingFacilitiesCard,
    DietaryRequirementCard,
    DietsCard,
    PreferredItemsCard,
    HygieneProductsCard,
    BabyProductsCard,
    PetFoodCard,
    OtherItemsCard,
    DeliveryInstructionsCard,
    AttentionFlagCard,
    SignpostingCallCard,
    ExtraInformationCard,
    ClientNotesCard,
];

const mapListSchemaToItems = (list: Schema["lists"][]): Item[] => {
    return list.map((item) => {
        return {
            primaryKey: item.primary_key,
            name: item.item_name,
            type: item.item_type as string,
            additionalInfoField: item.more_info_field,
        };
    });
};

const ClientForm: React.FC<Props> = ({
    initialFields,
    initialFormErrors,
    editConfig,
    returnPath,
}) => {
    const router = useRouter();
    const [fields, setFields] = useState<ClientFields>(initialFields);
    const [formErrors, setFormErrors] = useState<ClientErrors>(initialFormErrors);
    const [submitError, setSubmitError] = useState(Errors.none);
    const [submitErrorMessage, setSubmitErrorMessage] = useState("");
    const [submitDisabled, setSubmitDisabled] = useState(false);
    const [diets, setDiets] = useState<Diet[]>([]);
    const [items, setItems] = useState<Item[]>([]);
    const [fetchDataError, setFetchDataError] = useState<string | null>(null);

    useEffect(() => {
        if (fields.numberOfChildren <= fields.children.length) {
            fieldSetter({ children: fields.children.slice(0, fields.numberOfChildren) });
            return;
        }

        const extraChildren: Person[] = Array(fields.numberOfChildren - fields.children.length)
            .fill(0)
            .map((_item) => {
                return {
                    recordedAsChild: true,
                };
            });
        fieldSetter({ children: [...fields.children, ...extraChildren] });
    }, [fields.numberOfChildren]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (fields.numberOfAdults <= fields.adults.length) {
            fieldSetter({ adults: fields.adults.slice(0, fields.numberOfAdults) });
            return;
        }

        const extraAdults: Person[] = Array(fields.numberOfAdults - fields.adults.length)
            .fill(0)
            .map((_item) => {
                return {
                    recordedAsChild: false,
                };
            });
        fieldSetter({ adults: [...fields.adults, ...extraAdults] });
    }, [fields.numberOfAdults]); // eslint-disable-line react-hooks/exhaustive-deps

    const getDiets = useCallback(async (): Promise<void> => {
        const result = await fetchDiets(supabase);
        if (result.error) {
            setFetchDataError("Failed to fetch diets");
        } else {
            setDiets(result.data);
        }
    }, []);

    useEffect(() => {
        void getDiets();
    }, [getDiets]);

    const getPreferredItems = useCallback(async (): Promise<void> => {
        const result = await fetchLists(supabase);
        if (result.error) {
            setFetchDataError("Failed to fetch preferred items");
        } else {
            setItems(mapListSchemaToItems(result.data));
        }
    }, []);

    useEffect(() => {
        void getPreferredItems();
    }, [getPreferredItems]);

    const fieldSetter = createSetter(setFields, fields);
    const errorSetter = createSetter(setFormErrors, formErrors);

    const submitForm = async (): Promise<void> => {
        setSubmitDisabled(true);

        const inputError = checkErrorOnSubmit(formErrors, setFormErrors);
        if (inputError) {
            setSubmitError(Errors.submit);
            setSubmitDisabled(false);
            return;
        }

        if (editConfig.editMode) {
            const { clientId, error: editClientError } = await submitEditClientForm(
                fields,
                editConfig.clientID
            );
            if (editClientError) {
                switch (editClientError.type) {
                    case "failedToUpdateClientAndFamily":
                        setSubmitErrorMessage(
                            `Failed to update client and family. Log ID: ${editClientError.logId}`
                        );
                        break;
                    case "noRowsUpdated":
                        setSubmitErrorMessage(
                            `Update failed, please refresh. If the error persists, the client may have been deleted. Log ID: ${editClientError.logId}`
                        );
                        break;
                }
                setSubmitDisabled(false);
                return;
            }

            if (returnPath) {
                router.push(decodeURIComponent(returnPath));
            } else {
                router.push(`/clients?clientId=${clientId}`);
            }
        } else {
            const { clientId, error: addClientError } = await submitAddClientForm(fields);
            if (addClientError) {
                switch (addClientError.type) {
                    case "failedToInsertClientAndFamily":
                        setSubmitErrorMessage(
                            `Failed to add client and family. Log ID: ${addClientError.logId}`
                        );
                        break;
                }
                setSubmitDisabled(false);
                return;
            }

            let targetUrl = `/parcels/add/${clientId}`;
            if (returnPath) {
                const paramsRecord: Record<string, string> = {};
                paramsRecord[returnPathQueryParam] = returnPath;
                targetUrl += `?${stringifyQueryParams(paramsRecord)}`;
            }
            router.push(targetUrl);
        }
    };

    return (
        <>
            <CenterComponent>
                <StyledForm>
                    <Title>Client Form</Title>
                    <FormText>
                        Please provide or update the client&apos;s personal details, household
                        composition, dietary restrictions and other needs.
                    </FormText>
                    {formSections.map((Card, index) => {
                        return (
                            <Card
                                key={index} // eslint-disable-line react/no-array-index-key
                                formErrors={formErrors}
                                errorSetter={errorSetter}
                                fieldSetter={fieldSetter}
                                fields={fields}
                                diets={diets}
                                items={items}
                            />
                        );
                    })}
                    <CenterComponent>
                        <Button variant="contained" onClick={submitForm} disabled={submitDisabled}>
                            Submit
                        </Button>
                    </CenterComponent>
                    <FormErrorText>{submitErrorMessage || submitError}</FormErrorText>
                </StyledForm>
            </CenterComponent>
            {fetchDataError && (
                <FloatingToast message={fetchDataError} severity="error" variant="filled" />
            )}
        </>
    );
};

export default ClientForm;
