import React, { useState } from "react";
import {
    checkboxGroupToArray,
    FormErrors,
    getDefaultTextValue,
    onChangeCheckboxInGroup,
    onChangeText,
    Setter,
} from "@/components/Form/formFunctions";
import GenericFormCard from "@/components/Form/GenericFormCard";
import { ClientCardProps, ClientFields } from "../ClientForm";
import { Checkbox, FormControlLabel, FormGroup } from "@mui/material";
import FreeFormTextInput from "@/components/DataInput/FreeFormTextInput";
import CheckboxGroupInput from "@/components/DataInput/CheckboxGroupInput";

export const hygieneOtherItemsOptions: string[] = [
    "Female Incontinence Pads",
    "Male Incontinence Pads",
];

export const hygieneOtherItemsLabelsAndKeys: [string, string][] = hygieneOtherItemsOptions.map(
    (optionName) => [optionName, optionName]
);

const HygieneProductsCard: React.FC<ClientCardProps> = ({ errorSetter, fieldSetter, fields }) => {
    const [tamponsRequired, setTamponsRequired] = useState(
        fields["hygieneProductsTampons"] !== null
    );
    const [padsRequired, setPadsRequired] = useState(fields["hygieneProductsPads"] !== null);

    const handleTamponsCheckbox = (event: React.ChangeEvent<HTMLInputElement>): void => {
        setTamponsRequired(event.target.checked);

        if (!event.target.checked) {
            fieldSetter({ hygieneProductsTampons: null });
        }
    };

    const handlePadsCheckbox = (event: React.ChangeEvent<HTMLInputElement>): void => {
        setPadsRequired(event.target.checked);

        if (!event.target.checked) {
            fieldSetter({ hygieneProductsPads: null });
        }
    };

    return (
        <GenericFormCard title="Hygiene Products" required={false}>
            <FormGroup>
                <FormControlLabel
                    control={
                        <Checkbox checked={tamponsRequired} onChange={handleTamponsCheckbox} />
                    }
                    label="Tampons"
                />
                {tamponsRequired && (
                    <FreeFormTextInput
                        label="How Many"
                        defaultValue={getDefaultTextValue(fields, "hygieneProductsTampons")}
                        onChange={onChangeText(
                            fieldSetter,
                            errorSetter as Setter<FormErrors<ClientFields>>,
                            "hygieneProductsTampons",
                            {
                                required: false,
                            }
                        )}
                    />
                )}

                <FormControlLabel
                    control={<Checkbox checked={padsRequired} onChange={handlePadsCheckbox} />}
                    label="Pads"
                />
                {padsRequired && (
                    <FreeFormTextInput
                        label="How Many"
                        defaultValue={getDefaultTextValue(fields, "hygieneProductsPads")}
                        onChange={onChangeText(
                            fieldSetter,
                            errorSetter as Setter<FormErrors<ClientFields>>,
                            "hygieneProductsPads",
                            {
                                required: false,
                            }
                        )}
                    />
                )}

                <CheckboxGroupInput
                    labelsAndKeys={hygieneOtherItemsLabelsAndKeys}
                    onChange={onChangeCheckboxInGroup(
                        fieldSetter,
                        fields.hygieneOtherItems,
                        "hygieneOtherItems"
                    )}
                    checkedKeys={checkboxGroupToArray(fields.hygieneOtherItems)}
                />
            </FormGroup>
        </GenericFormCard>
    );
};

export default HygieneProductsCard;
