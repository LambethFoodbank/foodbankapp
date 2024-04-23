import React, { useState } from "react";
import FreeFormTextInput from "@/components/DataInput/FreeFormTextInput";
import {
    Errors,
    errorExists,
    errorText,
    getDefaultTextValue,
    onChangeText,
} from "@/components/Form/formFunctions";
import GenericFormCard from "@/components/Form/GenericFormCard";
import { GappedDiv } from "@/components/Form/formStyling";
import { ClientCardProps } from "../ClientForm";
import { Checkbox, FormControlLabel } from "@mui/material";

const postcodeRegex =
    /^([Gg][Ii][Rr] 0[Aa]{2})|((([A-Za-z][0-9]{1,2})|(([A-Za-z][A-Ha-hJ-Yj-y][0-9]{1,2})|(([A-Za-z][0-9][A-Za-z])|([A-Za-z][A-Ha-hJ-Yj-y][0-9][A-Za-z]?))))\s?[0-9][A-Za-z]{2})$/;
// Regex source: https://assets.publishing.service.gov.uk/government/uploads/system/uploads/attachment_data/file/488478/Bulk_Data_Transfer_-_additional_validation_valid_from_12_November_2015.pdf

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
            errorSetter([
                ["addressPostcode", Errors.none],
                ["addressLine1", Errors.none],
            ]);
            fieldSetter([
                ["addressPostcode", null],
                ["addressLine1", ""],
                ["addressLine2", ""],
                ["addressTown", ""],
                ["addressCounty", ""],
            ]);
        } else {
            errorSetter([
                ["addressPostcode", Errors.initial],
                ["addressLine1", Errors.initial],
            ]);
        }
        setTimeout(() => console.log(formErrors), 500);
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
                            helperText={errorText(formErrors.addressLine1)}
                            onChange={onChangeText(fieldSetter, errorSetter, "addressLine1", true)}
                        />
                        <FreeFormTextInput
                            label="Address Line 2"
                            defaultValue={getDefaultTextValue(fields, "addressLine2")}
                            onChange={onChangeText(fieldSetter, errorSetter, "addressLine2", false)}
                        />
                        <FreeFormTextInput
                            label="Town"
                            defaultValue={getDefaultTextValue(fields, "addressTown")}
                            onChange={onChangeText(fieldSetter, errorSetter, "addressTown", false)}
                        />
                        <FreeFormTextInput
                            label="County"
                            defaultValue={getDefaultTextValue(fields, "addressCounty")}
                            onChange={onChangeText(
                                fieldSetter,
                                errorSetter,
                                "addressCounty",
                                false
                            )}
                        />
                        <FreeFormTextInput
                            label="Postcode* (For example, SE11 5QY)"
                            defaultValue={getDefaultTextValue(fields, "addressPostcode")}
                            error={errorExists(formErrors.addressPostcode)}
                            helperText={errorText(formErrors.addressPostcode)}
                            onChange={onChangeText(
                                fieldSetter,
                                errorSetter,
                                "addressPostcode",
                                true,
                                postcodeRegex,
                                formatPostcode
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
