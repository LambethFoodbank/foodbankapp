"use client";

import React, { useState } from "react";
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
import HygieneProductsCard from "@/app/clients/form/formSections/HygieneProductsCard";
import BabyProductsCard from "@/app/clients/form/formSections/BabyProductsCard";
import PetFoodCard from "@/app/clients/form/formSections/PetFoodCard";
import OtherItemsCard from "@/app/clients/form/formSections/OtherItemsCard";
import DeliveryInstructionsCard from "@/common/formSections/DeliveryInstructionsCard";
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

type EditConfig =
    | { editMode: true; clientID: string; latestParcelId: string | null }
    | { editMode: false };

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
    hygieneProductsTampons: string | null;
    hygieneProductsPads: string | null;
    hygieneOtherItems: BooleanGroup;
    babyFood: string | null;
    babyFormula: string | null;
    babyNappies: string | null;
    babyOtherItems: BooleanGroup;
    petFood: BooleanGroup;
    otherItems: BooleanGroup;
    deliveryInstructions: string | null;
    lastUpdated: string | undefined;
    notes: string | null;
    additionalPhoneNumbers: string[] | null;
}

export interface ClientErrors extends FormErrors<ClientFields> {
    fullName: Errors;
    phoneNumber: Errors;
    additionalPhoneNumbers: Errors[];
    email: Errors;
    addressLine1: Errors;
    addressPostcode: Errors;
    numberOfAdults: Errors;
    numberOfChildren: Errors;
    listType: Errors;
    deliveryInstructions: Errors;
}

export type ClientSetter = Setter<ClientFields>;
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
    HygieneProductsCard,
    BabyProductsCard,
    PetFoodCard,
    OtherItemsCard,
    DeliveryInstructionsCard,
    ClientNotesCard,
];

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

    const fieldSetter = createSetter(setFields, fields);
    const errorSetter = createSetter(setFormErrors, formErrors);

    const submitLabel =
        editConfig.editMode && editConfig.latestParcelId
            ? "Submit and Edit Latest Parcel"
            : "Submit and Add Parcel";

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

            if (editConfig.latestParcelId) {
                router.push(appendReturnPathToUrl(`/parcels/edit/${editConfig.latestParcelId}`));
            } else {
                router.push(appendReturnPathToUrl(`/parcels/add/${clientId}`));
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

            router.push(appendReturnPathToUrl(`/parcels/add/${clientId}`));
        }
    };

    const appendReturnPathToUrl = (url: string): string => {
        if (returnPath) {
            const paramsRecord: Record<string, string> = {};
            paramsRecord[returnPathQueryParam] = returnPath;
            return (url += `?${stringifyQueryParams(paramsRecord)}`);
        }
        return url;
    };

    return (
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
                        />
                    );
                })}
                <CenterComponent>
                    <Button variant="contained" onClick={submitForm} disabled={submitDisabled}>
                        {submitLabel}
                    </Button>
                </CenterComponent>
                <FormErrorText>{submitErrorMessage || submitError}</FormErrorText>
            </StyledForm>
        </CenterComponent>
    );
};

export default ClientForm;
