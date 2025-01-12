import React from "react";
import {
    checkboxGroupToArray,
    onChangeCheckbox,
    onChangeRadioGroup,
} from "@/components/Form/formFunctions";
import GenericFormCard from "@/components/Form/GenericFormCard";
import RadioGroupInput from "@/components/DataInput/RadioGroupInput";
import { ClientCardProps } from "../ClientForm";
import { FormElementWithSpacing } from "@/components/Form/formStyling";
import CheckboxGroupInput from "@/components/DataInput/CheckboxGroupInput";

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

const SignpostingCallCard: React.FC<ClientCardProps> = ({ fieldSetter, fields }) => {
    return (
        <GenericFormCard
            title="Signposting Call"
            required={true}
            text="Does this client require a signposting call?"
        >
            <RadioGroupInput
                labelsAndValues={[
                    ["Yes", "Yes"],
                    ["No", "No"],
                ]}
                defaultValue={fields.signpostingCall ? "Yes" : "No"}
                onChange={onChangeRadioGroup(fieldSetter, "signpostingCall")}
            ></RadioGroupInput>

            <FormElementWithSpacing>
                <CheckboxGroupInput
                    groupLabel="What do they need help with? Tick all that apply. For 'Other', put details in the 'Extra Information' section."
                    labelsAndKeys={signpostingCallLabelsAndKeys}
                    onChange={onChangeCheckbox(
                        fieldSetter,
                        fields.signpostingCallReasons ?? {},
                        "signpostingCallReasons"
                    )}
                    checkedKeys={
                        fields.signpostingCallReasons
                            ? checkboxGroupToArray(fields.signpostingCallReasons)
                            : []
                    }
                    disabled={fields["signpostingCall"] !== true}
                />
            </FormElementWithSpacing>
        </GenericFormCard>
    );
};

export default SignpostingCallCard;
