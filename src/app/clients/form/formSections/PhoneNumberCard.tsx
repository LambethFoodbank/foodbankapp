import React, { useState, useEffect } from "react";
import FreeFormTextInput from "@/components/DataInput/FreeFormTextInput";
import {
    errorExists,
    getErrorText,
    getDefaultTextValue,
    onChangeText,
    onChangeAdditionalFields,
} from "@/components/Form/formFunctions";
import GenericFormCard from "@/components/Form/GenericFormCard";
import { ClientCardProps } from "../ClientForm";
import { formatPhoneNumber, phoneNumberRegex } from "@/common/format";
import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add";
import Divider from "@mui/material/Divider";

import { FormText, GappedDiv, GappedRowDiv } from "@/components/Form/formStyling";
import DeleteIcon from "@mui/icons-material/Delete";

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

    useEffect(() => {
        const additionalCount = fields.additionalPhoneNumbers?.length || 0;
        const expectedLength = additionalCount + 1;

        if (phoneNumbers.length !== expectedLength) {
            setPhoneNumbers(Array.from({ length: expectedLength }, (_, index) => ({ id: index })));
        }
    }, [fields.additionalPhoneNumbers?.length]);

    const handleAddPhoneNumber = () => {
        const newId = phoneNumbers.length - 1;
        setPhoneNumbers([...phoneNumbers, { id: newId }]);
    };

    const handleRemovePhoneNumber = (indexToRemove: number) => {
        setPhoneNumbers((prevPhoneNumbers) =>
            prevPhoneNumbers.filter((_, index) => index !== indexToRemove)
        );

        console.log(indexToRemove);

        const updatedAdditionalPhones = [...(fields.additionalPhoneNumbers || [])];
        updatedAdditionalPhones.splice(indexToRemove - 1, 1);
        console.log(updatedAdditionalPhones);

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
                        )}
                        {index === 1 && <FormText>Additional Phone Numbers</FormText>}
                        {index === 0 && (
                            <FreeFormTextInput
                                defaultValue={getDefaultTextValue(fields, "phoneNumber")}
                                error={errorExists(formErrors.phoneNumber)}
                                helperText={getErrorText(formErrors.phoneNumber)}
                                onChange={onChangeText(fieldSetter, errorSetter, "phoneNumber", {
                                    required: phoneNumberIsRequired,
                                    regex: phoneNumberRegex,
                                    formattingFunction: formatPhoneNumber,
                                })}
                            />
                        )}
                        {index >= 1 && (
                            <GappedRowDiv>
                                <FreeFormTextInput
                                    key={phone.id}
                                    id={`client-phone-number-${phone.id}`}
                                    label={`Phone Number ${index > 0 ? index + 1 : ""}`}
                                    defaultValue={fields.additionalPhoneNumbers?.[index - 1] || ""}
                                    error={errorExists(formErrors.additionalPhoneNumbers)}
                                    helperText={getErrorText(formErrors.additionalPhoneNumbers)}
                                    onChange={onChangeAdditionalFields(
                                        fieldSetter,
                                        fields.additionalPhoneNumbers,
                                        errorSetter,
                                        "additionalPhoneNumbers",
                                        index - 1,
                                        {
                                            required: phoneNumberIsRequired,
                                            regex: phoneNumberRegex,
                                            formattingFunction: formatPhoneNumber,
                                        }
                                    )}
                                />
                                <Button
                                    color="error"
                                    startIcon={<DeleteIcon />}
                                    onClick={() => handleRemovePhoneNumber(index)}
                                ></Button>
                            </GappedRowDiv>
                        )}
                    </GappedDiv>
                ))}
                <Button color="primary" startIcon={<AddIcon />} onClick={handleAddPhoneNumber}>
                    Add another phone number
                </Button>
            </GappedDiv>
        </GenericFormCard>
    );
};

export default PhoneNumberCard;
