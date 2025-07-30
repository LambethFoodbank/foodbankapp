import React, { useState } from "react";
import FreeFormTextInput from "@/components/DataInput/FreeFormTextInput";
import {
    errorExists,
    getErrorText,
    getDefaultTextValue,
    onChangeText,
} from "@/components/Form/formFunctions";
import GenericFormCard from "@/components/Form/GenericFormCard";
import { ClientCardProps } from "../ClientForm";
import { formatPhoneNumber, phoneNumberRegex } from "@/common/format";
import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import RemoveIcon from "@mui/icons-material/Remove";
import Divider from "@mui/material/Divider";

import { FormText, GappedDiv } from "@/components/Form/formStyling";

const phoneNumberIsRequired = false;

const PhoneNumberCard: React.FC<ClientCardProps> = ({
    formErrors,
    errorSetter,
    fieldSetter,
    fields,
}) => {
    const [phoneNumbers, setPhoneNumbers] = useState([{ id: 0 }]);

    const handleAddPhoneNumber = () => {
        const newId = phoneNumbers.length;
        setPhoneNumbers([...phoneNumbers, { id: newId }]);
    };

    const handleRemovePhoneNumber = () => {
        const lastId = phoneNumbers.length - 1;
        setPhoneNumbers((prev) => prev.filter((phone) => phone.id !== lastId));
    };

    return (
        <GenericFormCard
            title="Phone Number"
            required={phoneNumberIsRequired}
            text="Primary Phone Number"
        >
            <GappedDiv>
                {phoneNumbers.map((phone, index) => (
                    <GappedDiv key={index}>
                        {index === 1 && (
                            <Divider aria-hidden="true" orientation="horizontal" flexItem />
                        )}
                        {index === 1 && <FormText>{"Additional Phone Numbers"}</FormText>}
                        <FreeFormTextInput
                            key={phone.id}
                            id={`client-phone-number-${phone.id}`}
                            label={`Phone Number ${index > 0 ? index + 1 : ""}`}
                            defaultValue={getDefaultTextValue(fields, `phoneNumber${index || ""}`)}
                            error={errorExists(formErrors.phoneNumber)}
                            helperText={getErrorText(formErrors.phoneNumber)}
                            onChange={
                                index === 0
                                    ? onChangeText(fieldSetter, errorSetter, "phoneNumber", {
                                          required: phoneNumberIsRequired,
                                          regex: phoneNumberRegex,
                                          formattingFunction: formatPhoneNumber,
                                      })
                                    : onChangeText(
                                          fieldSetter,
                                          errorSetter,
                                          `phoneNumber${index}`,
                                          {
                                              required: phoneNumberIsRequired,
                                              regex: phoneNumberRegex,
                                              formattingFunction: formatPhoneNumber,
                                          }
                                      )
                            }
                        />
                    </GappedDiv>
                ))}
            </GappedDiv>
            <Button color="primary" startIcon={<AddIcon />} onClick={handleAddPhoneNumber}>
                Add another phone number
            </Button>
            {phoneNumbers.length > 1 && (
                <Button color="error" startIcon={<RemoveIcon />} onClick={handleRemovePhoneNumber}>
                    Remove last phone number
                </Button>
            )}
        </GenericFormCard>
    );
};

export default PhoneNumberCard;
