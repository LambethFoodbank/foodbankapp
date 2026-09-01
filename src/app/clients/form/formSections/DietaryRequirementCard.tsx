import React, { useState } from "react";
import CheckboxGroupInput from "@/components/DataInput/CheckboxGroupInput";
import { checkboxGroupToArray, onChangeCheckboxInGroup } from "@/components/Form/formFunctions";
import GenericFormCard from "@/components/Form/GenericFormCard";
import { ClientCardProps } from "../ClientForm";
import { Alert, Checkbox, FormControlLabel } from "@mui/material";
import { FormElementWithSpacing } from "@/components/Form/formStyling";

export const dietaryRequirementOptions: string[] = [
    "Fresh Fruit",
    "Fresh Veg",
    "Bread",
    "Tea",
    "Coffee",
    "Pasta",
    "Rice",
    "Meat (No Pork)",
    "Meat & Pork",
    "Fish",
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
            <Alert severity="info" variant="outlined">
                <p>
                    When going through dietary requirements, please explain that this is all
                    dependant on donations and
                </p>
                <p>
                    we are unable to take specific brand requests. We will not be able to fulfil any
                    toiletry requests except soap,
                </p>
                <p>
                    toilet paper and sanitary products. We will periodically have toiletries
                    available at our Hubs.
                </p>
                <br />
                <p>
                    If there are allergies in the household, please clarify who exactly has the
                    allergy.
                </p>
                <br />
                <p>Please see INFO section on the app for more details.</p>
            </Alert>
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
                    onChange={onChangeCheckboxInGroup(
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
