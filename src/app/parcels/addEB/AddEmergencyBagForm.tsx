"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
    CardProps,
    checkErrorOnSubmit,
    Errors,
    Fields,
    FormErrors,
    createSetter,
    Setter,
} from "@/components/Form/formFunctions";
import {
    CenterComponent,
    FormErrorText,
    FormText,
    StyledForm,
} from "@/components/Form/formStyling";
import Button from "@mui/material/Button";
import Title from "@/components/Title/Title";
import PackingDateCard from "@/app/parcels/form/formSections/PackingDateCard";
import CollectionCentreCard from "@/app/parcels/form/formSections/CollectionCentreCard";
import TypeOfEmergencyBagCard from "@/app/parcels/form/formSections/TypeOfEmergencyBagCard";

interface Props {
    initialFields: EmergencyBagFields;
    initialFormErrors: EmergencyBagErrors;
    editConfig: EditConfig;
    returnPath?: string | null;
}

type EditConfig = { editMode: true; clientID: string } | { editMode: false };

export interface EmergencyBagFields extends Fields {
    type: string;
    createdAt: string;
    collectionCentre: string;
    packingDate: string;
    amount: number;
}

export interface EmergencyBagErrors extends FormErrors<EmergencyBagFields> {
    type: Errors;
    collectionCentre: Errors;
    packingDate: Errors;
    amount: Errors;
}

export type EmergencyBagSetter = Setter<EmergencyBagFields>;
export type EmergencyBagErrorSetter = Setter<EmergencyBagErrors>;
export type EmergencyBagCardProps = CardProps<EmergencyBagFields, EmergencyBagErrors>;

const formSections = [CollectionCentreCard, PackingDateCard, TypeOfEmergencyBagCard];

const EmergencyBagForm: React.FC<Props> = ({
    initialFields,
    initialFormErrors,
    editConfig,
    returnPath,
}) => {
    const router = useRouter();
    const [fields, setFields] = useState<EmergencyBagFields>(initialFields);
    const [formErrors, setFormErrors] = useState<EmergencyBagErrors>(initialFormErrors);
    const [submitError, setSubmitError] = useState(Errors.none);
    const [submitErrorMessage, setSubmitErrorMessage] = useState("");
    const [submitDisabled, setSubmitDisabled] = useState(false);

    const [collectionCentresLabelsAndValues, setCollectionCentresLabelsAndValues] =
        useState<[string, string][]>([]);

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

        // if (editConfig.editMode) {
        //     const { clientId, error: editError } = await submitEditClientForm(
        //         fields,
        //         editConfig.clientID
        //     );
        //     if (editError) {
        //         setSubmitErrorMessage(`Failed to update emergency bag. Log ID: ${editError.logId}`);
        //         setSubmitDisabled(false);
        //         return;
        //     }
        //
        //     router.push(returnPath ? decodeURIComponent(returnPath) : "/emergency-bags");
        // } else {
        //     const { clientId, error: addError } = await submitAddClientForm(fields);
        //     if (addError) {
        //         setSubmitErrorMessage(`Failed to add emergency bag. Log ID: ${addError.logId}`);
        //         setSubmitDisabled(false);
        //         return;
        //     }
        //
        //     let targetUrl = `/emergency-bags/${clientId}`;
        //     if (returnPath) {
        //         const paramsRecord: Record<string, string> = {};
        //         paramsRecord[returnPathQueryParam] = returnPath;
        //         targetUrl += `?${stringifyQueryParams(paramsRecord)}`;
        //     }
        //     router.push(targetUrl);
        // }
    };

    return (
        <CenterComponent>
            <StyledForm>
                <Title>Emergency Bag Form</Title>
                <FormText>
                    Please provide the details about the Emergency Bag being created.
                </FormText>
                {formSections.map((Card, index) => (
                    <Card
                        key={index} // eslint-disable-line react/no-array-index-key
                        formErrors={formErrors}
                        errorSetter={errorSetter}
                        fieldSetter={fieldSetter}
                        fields={fields}
                        collectionCentresLabelsAndValues={collectionCentresLabelsAndValues}
                    />
                ))}
                <CenterComponent>
                    <Button variant="contained" onClick={submitForm} disabled={submitDisabled}>
                        Submit
                    </Button>
                </CenterComponent>
                <FormErrorText>{submitErrorMessage || submitError}</FormErrorText>
            </StyledForm>
        </CenterComponent>
    );
};

export default EmergencyBagForm;