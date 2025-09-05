import React, { useEffect, useState } from "react";
import FreeFormTextInput from "@/components/DataInput/FreeFormTextInput";
import {
    errorExists,
    Errors,
    FormErrors,
    getDefaultTextValue,
    getErrorText,
    onChangePhoneNumbers,
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

    const getPhoneNumberError = (index: number): boolean => {
        const error = formErrors.additionalPhoneNumbers?.[index];
        return error !== undefined && errorExists(error);
    };

    const validatePhoneSequence = (): string | null => {
        if (!fields.phoneNumber || fields.phoneNumber.length === 0) {
            return Errors.emptyPrimaryPhoneNumber;
        }

        const lastAdditionalIndex = phoneNumbers.length - 2;
        if (lastAdditionalIndex >= 0) {
            const lastPhone = fields.additionalPhoneNumbers?.[lastAdditionalIndex];
            if (!lastPhone || lastPhone.length === 0) {
                return Errors.emptyPreviousPhoneNumber;
            }
        }

        return null;
    };

    const handleAddPhoneNumber = (): void => {
        const newId = phoneNumbers.length - 1;
        if (validatePhoneSequence()) {
            setErrorMessage(validatePhoneSequence());
        } else {
            setPhoneNumbers([...phoneNumbers, { id: newId }]);
        }
    };

    const handleRemovePhoneNumber = (indexToRemove: number): void => {
        setPhoneNumbers((prevPhoneNumbers) =>
            prevPhoneNumbers.filter((_, index) => index !== indexToRemove)
        );

        const updatedAdditionalPhones = [...(fields.additionalPhoneNumbers || [])];
        formErrors.additionalPhoneNumbers[indexToRemove - 1] = Errors.none;
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
                {phoneNumbers.map((phone, index) => {
                    const isAdditionalPhone = index >= 1;
                    const additionalPhoneIndex = index - 1;
                    const displayAdditionalPhoneNumbers = index === 1;

                    return (
                        <GappedDiv key={phone.id}>
                            {displayAdditionalPhoneNumbers && (
                                <>
                                    <Divider aria-hidden="true" orientation="horizontal" flexItem />
                                    <FormText>Additional Phone Numbers</FormText>
                                </>
                            )}
                            {!isAdditionalPhone ? (
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
                                        formErrors,
                                        {
                                            required: phoneNumberIsRequired,
                                            regex: phoneNumberRegex,
                                            formattingFunction: formatPhoneNumber,
                                        }
                                    )}
                                />
                            ) : (
                                <GappedRowDiv>
                                    <FreeFormTextInput
                                        disabled={errorExists(formErrors.phoneNumber)}
                                        id={`client-additional-phone-number-${phone.id}`}
                                        label={`Phone Number ${index + 1}`}
                                        defaultValue={
                                            fields.additionalPhoneNumbers?.[additionalPhoneIndex] ||
                                            ""
                                        }
                                        error={getPhoneNumberError(additionalPhoneIndex)}
                                        helperText={getErrorText(
                                            formErrors.additionalPhoneNumbers?.[
                                                additionalPhoneIndex
                                            ]
                                        )}
                                        onChange={onChangePhoneNumbers(
                                            fieldSetter,
                                            fields.phoneNumber,
                                            fields.additionalPhoneNumbers,
                                            errorSetter as Setter<FormErrors<ClientFields>>,
                                            "additionalPhoneNumbers",
                                            formErrors,
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
                    );
                })}
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
