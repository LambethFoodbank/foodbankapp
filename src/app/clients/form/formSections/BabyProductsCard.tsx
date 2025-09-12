import React, { useState } from "react";
import {
    onChangeText,
    getDefaultTextValue,
    onChangeCheckboxInGroup,
    checkboxGroupToArray,
    Setter,
    FormErrors,
} from "@/components/Form/formFunctions";
import FreeFormTextInput from "@/components/DataInput/FreeFormTextInput";
import GenericFormCard from "@/components/Form/GenericFormCard";
import { ClientCardProps, ClientFields } from "../ClientForm";
import { Checkbox, FormControlLabel, FormGroup } from "@mui/material";
import CheckboxGroupInput from "@/components/DataInput/CheckboxGroupInput";

export const babyOtherItemsOptions: string[] = ["Baby Wipes", "Baby Toiletries"];

export const babyOtherItemsLabelsAndKeys: [string, string][] = babyOtherItemsOptions.map(
    (optionName) => [optionName, optionName]
);

const BabyProductsCard: React.FC<ClientCardProps> = ({ errorSetter, fieldSetter, fields }) => {
    const [nappiesRequired, setNappiesRequired] = useState(fields["babyNappies"] !== null);
    const [formulaRequired, setFormulaRequired] = useState(fields["babyFormula"] !== null);
    const [foodRequired, setFoodRequired] = useState(fields["babyFood"] !== null);

    const handleNappiesCheckbox = (event: React.ChangeEvent<HTMLInputElement>): void => {
        setNappiesRequired(event.target.checked);

        if (!event.target.checked) {
            fieldSetter({ babyNappies: null });
        }
    };

    const handleFormulaCheckbox = (event: React.ChangeEvent<HTMLInputElement>): void => {
        setFormulaRequired(event.target.checked);

        if (!event.target.checked) {
            fieldSetter({ babyFormula: null });
        }
    };

    const handleFoodCheckbox = (event: React.ChangeEvent<HTMLInputElement>): void => {
        setFoodRequired(event.target.checked);

        if (!event.target.checked) {
            fieldSetter({ babyFood: null });
        }
    };

    return (
        <GenericFormCard title="Baby Products" required={false}>
            <FormGroup>
                <FormControlLabel
                    control={
                        <Checkbox checked={nappiesRequired} onChange={handleNappiesCheckbox} />
                    }
                    label="Nappies"
                />
                {nappiesRequired && (
                    <FreeFormTextInput
                        label="What Size"
                        defaultValue={getDefaultTextValue(fields, "babyNappies")}
                        onChange={onChangeText(
                            fieldSetter,
                            errorSetter as Setter<FormErrors<ClientFields>>,
                            "babyNappies",
                            {
                                required: false,
                            }
                        )}
                    />
                )}

                <FormControlLabel
                    control={
                        <Checkbox checked={formulaRequired} onChange={handleFormulaCheckbox} />
                    }
                    label="Baby Formula"
                />
                {formulaRequired && (
                    <FreeFormTextInput
                        label="Specify brand and stage"
                        defaultValue={getDefaultTextValue(fields, "babyFormula")}
                        onChange={onChangeText(
                            fieldSetter,
                            errorSetter as Setter<FormErrors<ClientFields>>,
                            "babyFormula",
                            {
                                required: false,
                            }
                        )}
                    />
                )}

                <FormControlLabel
                    control={<Checkbox checked={foodRequired} onChange={handleFoodCheckbox} />}
                    label="Baby Food"
                />
                {foodRequired && (
                    <FreeFormTextInput
                        label="More Info"
                        defaultValue={getDefaultTextValue(fields, "babyFood")}
                        onChange={onChangeText(
                            fieldSetter,
                            errorSetter as Setter<FormErrors<ClientFields>>,
                            "babyFood",
                            {
                                required: false,
                            }
                        )}
                    />
                )}

                <CheckboxGroupInput
                    labelsAndKeys={babyOtherItemsLabelsAndKeys}
                    onChange={onChangeCheckboxInGroup(
                        fieldSetter,
                        fields.babyOtherItems,
                        "babyOtherItems"
                    )}
                    checkedKeys={checkboxGroupToArray(fields.babyOtherItems)}
                />
            </FormGroup>
        </GenericFormCard>
    );
};

export default BabyProductsCard;
