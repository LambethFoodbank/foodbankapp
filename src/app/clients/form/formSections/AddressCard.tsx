import React, { useState } from "react";
import FreeFormTextInput from "@/components/DataInput/FreeFormTextInput";
import {
    Errors,
    errorExists,
    getErrorText,
    getDefaultTextValue,
    onChangeText,
    Setter,
    FormErrors,
} from "@/components/Form/formFunctions";
import GenericFormCard from "@/components/Form/GenericFormCard";
import { GappedDiv } from "@/components/Form/formStyling";
import { ClientCardProps, ClientFields } from "../ClientForm";
import { Checkbox, FormControlLabel } from "@mui/material";
import { postcodeRegex } from "@/common/format";

const formatPostcode = (value: string): string => {
    return value.toUpperCase();
};

const AddressCard: React.FC<ClientCardProps> = ({
    formErrors,
    errorSetter,
    fieldSetter,
    fields,
}) => {
    const [clientHasNoAddress, setClientHasNoAddress] = useState(
        fields["addressPostcode"] === null
    );

    const handleCheckCheckbox = (event: React.ChangeEvent<HTMLInputElement>): void => {
        setClientHasNoAddress(event.target.checked);
        if (event.target.checked) {
            errorSetter({ addressPostcode: Errors.none, addressLine1: Errors.none });
            fieldSetter({
                addressPostcode: null,
                addressLine1: "",
                addressLine2: "",
                addressTown: "",
                addressCounty: "",
            });
        } else {
            errorSetter({ addressPostcode: Errors.initial, addressLine1: Errors.initial });
        }
    };

    return (
        <GenericFormCard
            title="Address"
            required={true}
            text="Please enter the flat/house number if applicable."
        >
            <GappedDiv>
                {!clientHasNoAddress && (
                    <>
                        <FreeFormTextInput
                            label="Address Line 1*"
                            defaultValue={getDefaultTextValue(fields, "addressLine1")}
                            error={errorExists(formErrors.addressLine1)}
                            helperText={getErrorText(formErrors.addressLine1)}
                            onChange={onChangeText(
                                fieldSetter,
                                errorSetter as Setter<FormErrors<ClientFields>>,
                                "addressLine1",
                                {
                                    required: true,
                                }
                            )}
                        />
                        <FreeFormTextInput
                            label="Address Line 2"
                            defaultValue={getDefaultTextValue(fields, "addressLine2")}
                            onChange={onChangeText(
                                fieldSetter,
                                errorSetter as Setter<FormErrors<ClientFields>>,
                                "addressLine2",
                                {
                                    required: false,
                                }
                            )}
                        />
                        <FreeFormTextInput
                            label="Town"
                            defaultValue={getDefaultTextValue(fields, "addressTown")}
                            onChange={onChangeText(
                                fieldSetter,
                                errorSetter as Setter<FormErrors<ClientFields>>,
                                "addressTown",
                                {
                                    required: false,
                                }
                            )}
                        />
                        <FreeFormTextInput
                            label="County"
                            defaultValue={getDefaultTextValue(fields, "addressCounty")}
                            onChange={onChangeText(
                                fieldSetter,
                                errorSetter as Setter<FormErrors<ClientFields>>,
                                "addressCounty",
                                {
                                    required: false,
                                }
                            )}
                        />
                        <FreeFormTextInput
                            id="client-address-postcode"
                            label="Postcode* (For example, SE11 5QY)"
                            defaultValue={getDefaultTextValue(fields, "addressPostcode")}
                            error={errorExists(formErrors.addressPostcode)}
                            helperText={getErrorText(formErrors.addressPostcode)}
                            onChange={onChangeText(
                                fieldSetter,
                                errorSetter as Setter<FormErrors<ClientFields>>,
                                "addressPostcode",
                                {
                                    required: true,
                                    regex: postcodeRegex,
                                    formattingFunction: formatPostcode,
                                }
                            )}
                        />
                    </>
                )}
                <FormControlLabel
                    control={
                        <Checkbox checked={clientHasNoAddress} onChange={handleCheckCheckbox} />
                    }
                    label="No address"
                />
            </GappedDiv>
        </GenericFormCard>
    );
};

export default AddressCard;
