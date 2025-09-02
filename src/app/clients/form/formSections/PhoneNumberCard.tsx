import React, { useState, useEffect } from "react";
import FreeFormTextInput from "@/components/DataInput/FreeFormTextInput";
import {
    errorExists,
    getErrorText,
    getDefaultTextValue,
    onChangePhoneNumbers,
    FormErrors,
    Setter,
} from "@/components/Form/formFunctions";
import GenericFormCard from "@/components/Form/GenericFormCard";
import { ClientCardProps, ClientFields } from "../ClientForm";
import { formatPhoneNumber, phoneNumberRegex } from "@/common/format";
import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add";
import Divider from "@mui/material/Divider";

import { FormText, GappedDiv, GappedRowDiv } from "@/components/Form/formStyling";
import DeleteIcon from "@mui/icons-material/Delete";
import FloatingToast from "@/components/FloatingToast";

const phoneNumberIsRequired = false;

const PhoneNumberCard: React.FC<ClientCardProps> = ({
    formErrors,
    errorSetter,
    fieldSetter,
    fields,
}) => {
    const [phoneNumbers, setPhoneNumbers] = useState(() => {
        const additionalCount = fields.additionalPhoneNumbers?.length || 0;
        return Array.from({ length: additionalCount + 1 }, (_, index) => ({ id: index }));
    });
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        const additionalCount = fields.additionalPhoneNumbers?.length || 0;
        const expectedLength = additionalCount + 1;

        if (phoneNumbers.length !== expectedLength) {
            setPhoneNumbers(Array.from({ length: expectedLength }, (_, index) => ({ id: index })));
        }
    }, [fields.additionalPhoneNumbers?.length]); //eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (errorMessage) {
            const timer = setTimeout(() => {
                setErrorMessage(null);
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [errorMessage]);

    const handleAddPhoneNumber = (): void => {
        const newId = phoneNumbers.length - 1;
        if (newId > 0) {
            if (
                fields.additionalPhoneNumbers &&
                fields.additionalPhoneNumbers[newId - 1] !== undefined &&
                fields.additionalPhoneNumbers[newId - 1].length > 1
            ) {
                setPhoneNumbers([...phoneNumbers, { id: newId }]);
            } else {
                setErrorMessage(
                    "The previous phone number should be filled before adding another phone number."
                );
            }
        } else {
            if (fields.phoneNumber && fields.phoneNumber.length > 0) {
                setPhoneNumbers([...phoneNumbers, { id: newId }]);
            } else {
                setErrorMessage(
                    "The primary phone number should be filled before adding another phone number."
                );
            }
        }
    };

    const handleRemovePhoneNumber = (indexToRemove: number): void => {
        setPhoneNumbers((prevPhoneNumbers) =>
            prevPhoneNumbers.filter((_, index) => index !== indexToRemove)
        );

        const updatedAdditionalPhones = [...(fields.additionalPhoneNumbers || [])];
        updatedAdditionalPhones.splice(indexToRemove - 1, 1);

        fieldSetter({ additionalPhoneNumbers: updatedAdditionalPhones });
    };

    return (
        <GenericFormCard
            title="Phone Number"
            required={phoneNumberIsRequired}
            text="Primary Phone Number"
        >
            <GappedDiv>
                {phoneNumbers.map((phone, index) => (
                    // eslint-disable-next-line react/no-array-index-key
                    <GappedDiv key={index}>
                        {index === 1 && (
                                <Divider aria-hidden="true" orientation="horizontal" flexItem />
                            ) && <FormText>Additional Phone Numbers</FormText>}
                        {index === 0 && (
                            <FreeFormTextInput
                                id="client-phone-number"
                                label="Primary Phone Number"
                                defaultValue={getDefaultTextValue(fields, "phoneNumber")}
                                error={errorExists(formErrors.phoneNumber)}
                                helperText={getErrorText(formErrors.phoneNumber)}
                                onChange={onChangePhoneNumbers(
                                    fieldSetter,
                                    fields.phoneNumber,
                                    fields.additionalPhoneNumbers,
                                    errorSetter as Setter<FormErrors<ClientFields>>,
                                    "phoneNumber",
                                    {
                                        required: phoneNumberIsRequired,
                                        regex: phoneNumberRegex,
                                        formattingFunction: formatPhoneNumber,
                                    }
                                )}
                            />
                        )}
                        {index >= 1 && (
                            <GappedRowDiv>
                                <FreeFormTextInput
                                    disabled={errorExists(formErrors.phoneNumber)}
                                    key={phone.id}
                                    id={`client-additional-phone-number-${phone.id}`}
                                    label={`Phone Number ${index > 0 ? index + 1 : ""}`}
                                    defaultValue={fields.additionalPhoneNumbers?.[index - 1] || ""}
                                    error={
                                        formErrors.additionalPhoneNumbers?.[index - 1] !==
                                            undefined &&
                                        errorExists(formErrors.additionalPhoneNumbers?.[index - 1])
                                    }
                                    helperText={getErrorText(
                                        formErrors.additionalPhoneNumbers?.[index - 1]
                                    )}
                                    onChange={onChangePhoneNumbers(
                                        fieldSetter,
                                        fields.phoneNumber,
                                        fields.additionalPhoneNumbers,
                                        errorSetter as Setter<FormErrors<ClientFields>>,
                                        "additionalPhoneNumbers",
                                        {
                                            required: phoneNumberIsRequired,
                                            regex: phoneNumberRegex,
                                            formattingFunction: formatPhoneNumber,
                                        },
                                        index - 1
                                    )}
                                />
                                <Button
                                    color="error"
                                    startIcon={<DeleteIcon />}
                                    id={`remove-additional-phone-number-${phone.id}`}
                                    onClick={() => handleRemovePhoneNumber(index)}
                                ></Button>
                            </GappedRowDiv>
                        )}
                    </GappedDiv>
                ))}
                <Button color="primary" startIcon={<AddIcon />} onClick={handleAddPhoneNumber}>
                    Add another phone number
                </Button>
                {errorMessage && (
                    <FloatingToast
                        message={errorMessage}
                        severity="warning"
                        variant="filled"
                    ></FloatingToast>
                )}
            </GappedDiv>
        </GenericFormCard>
    );
};

export default PhoneNumberCard;
