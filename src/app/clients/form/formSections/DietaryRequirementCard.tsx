import React, { useState } from "react";
import CheckboxGroupInput from "@/components/DataInput/CheckboxGroupInput";
import { checkboxGroupToArray, onChangeCheckbox } from "@/components/Form/formFunctions";
import GenericFormCard from "@/components/Form/GenericFormCard";
import { ClientCardProps } from "../ClientForm";
import { Checkbox, FormControlLabel } from "@mui/material";
import { FormElementWithSpacing } from "@/components/Form/formStyling";

export const dietaryRequirementOptions: string[] = [
    "Fresh Fruit",
    "Fresh Veg",
    "Garlic",
    "Ginger",
    "Chillies",
    "Spices",
    "Bread",
    "Tea",
    "Coffee",
    "Pasta",
    "Rice",
    "Meat (No Pork)",
    "Meat & Pork",
    "Gluten Free",
    "Dairy Free",
    "Vegetarian",
    "Vegan",
    "Pescatarian",
    "Halal",
    "Diabetic",
    "Nut Allergy",
    "Seafood Allergy",
];

export const dietaryRequirementLabelsAndKeys: [string, string][] = dietaryRequirementOptions.map(
    (optionName) => [optionName, optionName]
);

const DietaryRequirementCard: React.FC<ClientCardProps> = ({ fieldSetter, fields }) => {
    const [unknownDietaryRequirements, setUnknownDietaryRequirements] = useState(
        fields["dietaryRequirements"] === null
    );

    const handleCheckCheckboxForUnknown = (event: React.ChangeEvent<HTMLInputElement>): void => {
        setUnknownDietaryRequirements(event.target.checked);

        fieldSetter({ dietaryRequirements: null });
    };

    return (
        <GenericFormCard title="Dietary Requirements" required={false}>
            <FormControlLabel
                control={
                    <Checkbox
                        checked={unknownDietaryRequirements}
                        onChange={handleCheckCheckboxForUnknown}
                    />
                }
                label="Don't Know"
            />
            <FormElementWithSpacing>
                <CheckboxGroupInput
                    groupLabel="Tick all that apply"
                    labelsAndKeys={dietaryRequirementLabelsAndKeys}
                    onChange={onChangeCheckbox(
                        fieldSetter,
                        fields.dietaryRequirements ?? {},
                        "dietaryRequirements"
                    )}
                    checkedKeys={
                        fields.dietaryRequirements
                            ? checkboxGroupToArray(fields.dietaryRequirements)
                            : []
                    }
                    disabled={!!unknownDietaryRequirements}
                />
            </FormElementWithSpacing>
        </GenericFormCard>
    );
};

export default DietaryRequirementCard;
