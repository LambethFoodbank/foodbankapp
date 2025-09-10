"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    CardProps,
    checkErrorOnSubmit,
    Errors,
    Fields,
    FormErrors,
    createSetter,
} from "@/components/Form/formFunctions";
import {
    CenterComponent,
    FormErrorText,
    FormText,
    StyledForm,
} from "@/components/Form/formStyling";
import Button from "@mui/material/Button";
import Title from "@/components/Title/Title";
import TypeOfEmergencyBagCard from "@/app/emergency-bags/form/formSections/TypeOfEmergencyBagCard";
import { CollectionCentresLabelsAndValues, getActiveCollectionCentres } from "@/common/fetch";
import supabase from "@/supabaseClient";
import HubCard from "@/app/emergency-bags/form/formSections/HubCard";
import PackingDateEmergencyBagCard from "@/app/emergency-bags/form/formSections/PackingDateEmergencyBagCard";
import AmountCard from "@/app/emergency-bags/form/formSections/AmountCard";
import { getDbDate } from "@/common/format";
import dayjs from "dayjs";
import {
    WriteEmergencyBagToDatabaseErrors,
    WriteEmergencyBagToDatabaseFunction,
} from "@/app/emergency-bags/form/submitFormHelpers";
import { logErrorReturnLogId } from "@/logger/logger";

interface EmergencyBagProps {
    initialFields: EmergencyBagFields;
    initialFormErrors: EmergencyBagErrors;
    writeEmergencyBagInfoToDatabase: WriteEmergencyBagToDatabaseFunction;
    returnPath?: string | null;
}

export interface EmergencyBagFields extends Fields {
    type: string;
    createdAt: string;
    hub: string;
    packingDate: string;
    amount: number;
    lastUpdated: string;
    otherInfo: string;
}

export interface EmergencyBagErrors extends FormErrors<EmergencyBagFields> {
    type: Errors;
    hub: Errors;
    packingDate: Errors;
    amount: Errors;
    otherInfo: Errors;
}

export const initialEmergencyBagFields: EmergencyBagFields = {
    type: "",
    createdAt: "",
    hub: "",
    packingDate: "",
    amount: 0,
    lastUpdated: new Date().toISOString(),
    otherInfo: "",
};

export const initialEmergencyBagFormErrors: EmergencyBagErrors = {
    type: Errors.initial,
    hub: Errors.initial,
    packingDate: Errors.initial,
    amount: Errors.initial,
    otherInfo: Errors.initial,
};

export type EmergencyBagCardProps = CardProps<EmergencyBagFields, EmergencyBagErrors>;

type FetchCollectionCentresResponse =
    | { data: CollectionCentresLabelsAndValues; error: null }
    | { data: null; error: FetchCollectionCentresError };

type FetchCollectionCentresErrorType = "failedToFetchCollectionCentres" | "noCollectionCentres";
interface FetchCollectionCentresError extends Record<string, string> {
    type: FetchCollectionCentresErrorType;
    logId: string;
}

const formSections = [HubCard, PackingDateEmergencyBagCard, TypeOfEmergencyBagCard, AmountCard];

const databaseErrorMessageFromErrorType = (
    errorType: WriteEmergencyBagToDatabaseErrors,
    logId: string
): string => {
    switch (errorType) {
        case "failedToInsertEmergencyBag":
            return `Failed to insert emergency bag. Log ID: ${logId}`;
        case "failedToUpdateEmergencyBag":
            return `Failed to update emergency bag. Log ID: ${logId}`;
        case "concurrentUpdateConflict":
            return `Record has been edited recently - please refresh the page. LogID: ${logId}`;
    }
};

const fetchCollectionCentres = async (): Promise<FetchCollectionCentresResponse> => {
    const { data: hubData, error: hubError } = await getActiveCollectionCentres(supabase);

    if (hubError) {
        const logId = await logErrorReturnLogId("Failed to fetch: Collection Centres", {
            hubError,
        });
        return { data: null, error: { type: "failedToFetchCollectionCentres", logId } };
    }

    if (!hubData?.collectionCentresLabelsAndValues?.length) {
        const logId = await logErrorReturnLogId("No data for Collection Centres");
        return { data: null, error: { type: "noCollectionCentres", logId } };
    }

    return { data: hubData.collectionCentresLabelsAndValues, error: null };
};

const EmergencyBagForm: React.FC<EmergencyBagProps> = ({
    initialFields,
    initialFormErrors,
    writeEmergencyBagInfoToDatabase,
    returnPath,
}) => {
    const router = useRouter();
    const [fields, setFields] = useState<EmergencyBagFields>(initialFields);
    const [formErrors, setFormErrors] = useState<EmergencyBagErrors>(initialFormErrors);
    const [submitError, setSubmitError] = useState(Errors.none);
    const [submitErrorMessage, setSubmitErrorMessage] = useState("");
    const [submitDisabled, setSubmitDisabled] = useState(false);

    const [hubLabelsAndValues, setHubLabelsAndValues] = useState<[string, string][]>([]);

    const fieldSetter = createSetter(setFields, fields);
    const errorSetter = createSetter(setFormErrors, formErrors);

    useEffect(() => {
        (async () => {
            const { data, error } = await fetchCollectionCentres();
            if (error) {
                setSubmitErrorMessage(`Failed to load collection centres. Log ID: ${error.logId}`);
                setHubLabelsAndValues([]);
                return;
            }
            setHubLabelsAndValues(data);
        })();
    }, [fields.packingDate]);

    const submitForm = async (): Promise<void> => {
        setSubmitErrorMessage("");
        setSubmitDisabled(true);

        const fieldsToCheck = ["type", "hub", "packingDate", "amount"];
        if (fields.type === "Other") {
            fieldsToCheck.push("otherInfo");
        }

        const inputError = checkErrorOnSubmit(formErrors, setFormErrors, fieldsToCheck);

        if (inputError) {
            setSubmitError(Errors.submit);
            setSubmitDisabled(false);
            return;
        }

        const packingDate = getDbDate(dayjs(fields.packingDate));

        const emergencyBagRecord = {
            collection_centre: fields.hub,
            type: fields.type === "Other" ? fields.otherInfo : fields.type,
            packing_date: packingDate,
            amount: fields.amount,
            last_updated: fields.lastUpdated,
        };

        const { emergencyBagId, error } = await writeEmergencyBagInfoToDatabase(emergencyBagRecord);

        if (emergencyBagId) {
            if (returnPath) {
                router.push(decodeURIComponent(returnPath));
            } else {
                // TODO: change to emergency bags for that bagId page when it is created
                router.push("/parcels");
            }
        }

        if (error) {
            if (error.type !== "concurrentUpdateConflict") {
                setSubmitDisabled(false);
            }

            setSubmitErrorMessage(databaseErrorMessageFromErrorType(error.type, error.logId));
        }
    };

    return (
        <>
            <CenterComponent>
                <StyledForm style={{ width: "60%" }}>
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
                            hubLabelsAndValues={hubLabelsAndValues}
                        />
                    ))}
                    <CenterComponent>
                        <Button variant="contained" onClick={submitForm} disabled={submitDisabled}>
                            Submit
                        </Button>
                    </CenterComponent>
                </StyledForm>
            </CenterComponent>
            <CenterComponent>
                <FormErrorText>{submitErrorMessage || submitError}</FormErrorText>
            </CenterComponent>
        </>
    );
};

export default EmergencyBagForm;
