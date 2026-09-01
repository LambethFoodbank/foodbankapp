import React, { useState } from "react";
import CheckboxGroupInput from "@/components/DataInput/CheckboxGroupInput";
import { checkboxGroupToArray, onChangeCheckboxInGroup } from "@/components/Form/formFunctions";
import GenericFormCard from "@/components/Form/GenericFormCard";
import { ClientCardProps } from "../ClientForm";
import { Alert, Checkbox, FormControlLabel } from "@mui/material";
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
        <GenericFormCard title="Cooking Facilities" required={false}>
            <Alert severity="info" variant="outlined">
                <p>Please verify what cooking facilities the client has available to them.</p>
                <p>
                    Even if they don&apos;t have it in their own home, they may be able to access
                    elsewhere.
                </p>
                <p>
                    They also may also may be able to utilise other appliances even if they
                    don&apos;t have an oven or hob
                </p>
                <p>using an airfryer or microwave to serve the same purpose.</p>
            </Alert>
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
