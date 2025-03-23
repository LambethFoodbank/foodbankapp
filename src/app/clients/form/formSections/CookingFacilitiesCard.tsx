import React, { useState } from "react";
import CheckboxGroupInput from "@/components/DataInput/CheckboxGroupInput";
import { checkboxGroupToArray, onChangeCheckboxInGroup } from "@/components/Form/formFunctions";
import GenericFormCard from "@/components/Form/GenericFormCard";
import { ClientCardProps } from "../ClientForm";
import { Checkbox, FormControlLabel } from "@mui/material";
import { FormElementWithSpacing } from "@/components/Form/formStyling";

export const cookingFacilitiesOptions: string[] = [
    "None",
    "Microwave",
    "Kettle",
    "Hob",
    "Oven",
    "Air Fryer",
    "Toaster",
    "Other",
];

export const cookingFacilitiesLabelsAndKeys: [string, string][] = cookingFacilitiesOptions.map(
    (optionName) => [optionName, optionName]
);

const CookingFacilitiesCard: React.FC<ClientCardProps> = ({ fieldSetter, fields }) => {
    const [unknownCookingFacilities, setUnknownCookingFacilities] = useState(
        fields["cookingFacilities"] === null
    );

    const handleCheckCheckboxForUnknown = (event: React.ChangeEvent<HTMLInputElement>): void => {
        setUnknownCookingFacilities(event.target.checked);

        fieldSetter({ cookingFacilities: null });
    };

    return (
        <GenericFormCard
            title="Cooking Facilities"
            required={false}
            text="What cooking facilities does the client have? For 'Other', put details in the 'Extra Information' section."
        >
            <FormControlLabel
                control={
                    <Checkbox
                        checked={unknownCookingFacilities}
                        onChange={handleCheckCheckboxForUnknown}
                    />
                }
                label="Don't Know"
            />
            <FormElementWithSpacing>
                <CheckboxGroupInput
                    groupLabel="Tick all that apply"
                    labelsAndKeys={cookingFacilitiesLabelsAndKeys}
                    onChange={onChangeCheckboxInGroup(
                        fieldSetter,
                        fields.cookingFacilities ?? {},
                        "cookingFacilities"
                    )}
                    checkedKeys={
                        fields.cookingFacilities
                            ? checkboxGroupToArray(fields.cookingFacilities)
                            : []
                    }
                    disabled={!!unknownCookingFacilities}
                />
            </FormElementWithSpacing>
        </GenericFormCard>
    );
};

export default CookingFacilitiesCard;
