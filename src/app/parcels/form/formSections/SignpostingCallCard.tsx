import React, { useState } from "react";
import {
    checkboxGroupToArray,
    onChangeCheckboxInGroup,
    onChangeRadioGroup,
} from "@/components/Form/formFunctions";
import GenericFormCard from "@/components/Form/GenericFormCard";
import RadioGroupInput from "@/components/DataInput/RadioGroupInput";
import { FormElementWithSpacing } from "@/components/Form/formStyling";
import CheckboxGroupInput from "@/components/DataInput/CheckboxGroupInput";
import {
    Alert,
    Checkbox,
    FormControl,
    FormControlLabel,
    FormGroup,
    FormLabel,
} from "@mui/material";
import { ParcelCardProps } from "@/app/parcels/form/ParcelForm";

export const signpostingCallOptions: string[] = [
    "Benefits",
    "Debt",
    "Housing",
    "Cost of Living",
    "Mental Health",
    "Other",
];

export const signpostingCallLabelsAndKeys: [string, string][] = signpostingCallOptions.map(
    (optionName) => [optionName, optionName]
);

const SignpostingCallCard: React.FC<ParcelCardProps> = ({ fieldSetter, fields }) => {
    const [unknownSignpostingReasons, setUnknownSignpostingReasons] = useState(
        fields["signpostingCallReasons"] === null
    );

    const handleCheckCheckboxForUnknown = (event: React.ChangeEvent<HTMLInputElement>): void => {
        setUnknownSignpostingReasons(event.target.checked);

        fieldSetter({ signpostingCallReasons: null });
    };

    return (
        <GenericFormCard
            title="Signposting Call"
            required={true}
            text="Does this client require a signposting call?"
        >
            <Alert severity="info" variant="outlined">
                <p>
                    If this is the first time a client is receiving a parcel, please always tick
                    &apos;Yes&apos;, &apos;Generic&apos; and
                </p>
                <p>
                    explain that we will provide them with a follow-up call to inform them of other
                    services available in addition to the food.
                </p>
            </Alert>
            <RadioGroupInput
                labelsAndValues={[
                    ["Yes", "Yes"],
                    ["No", "No"],
                ]}
                defaultValue={fields.signpostingCall ? "Yes" : "No"}
                onChange={onChangeRadioGroup(fieldSetter, "signpostingCall")}
            ></RadioGroupInput>

            <FormElementWithSpacing>
                <FormControl disabled={!fields["signpostingCall"]}>
                    <FormLabel>What do they need help with?</FormLabel>
                    <FormGroup>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={unknownSignpostingReasons}
                                    onChange={handleCheckCheckboxForUnknown}
                                    disabled={!fields["signpostingCall"]}
                                />
                            }
                            label="Generic"
                        />
                    </FormGroup>
                </FormControl>
            </FormElementWithSpacing>

            <FormElementWithSpacing>
                <CheckboxGroupInput
                    groupLabel="Tick all that apply. For 'Other', put details in the 'Notes' section."
                    labelsAndKeys={signpostingCallLabelsAndKeys}
                    onChange={onChangeCheckboxInGroup(
                        fieldSetter,
                        fields.signpostingCallReasons ?? {},
                        "signpostingCallReasons"
                    )}
                    checkedKeys={
                        fields.signpostingCallReasons
                            ? checkboxGroupToArray(fields.signpostingCallReasons)
                            : []
                    }
                    disabled={unknownSignpostingReasons || !fields["signpostingCall"]}
                />
            </FormElementWithSpacing>
        </GenericFormCard>
    );
};

export default SignpostingCallCard;
