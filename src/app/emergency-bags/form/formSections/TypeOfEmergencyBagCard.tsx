import React from "react";
import GenericFormCard from "@/components/Form/GenericFormCard";
import { ErrorText } from "@/components/Form/formStyling";
import { ControlledSelect } from "@/components/DataInput/DropDownSelect";
import {
    getDefaultTextValue,
    getErrorText,
    onChangeText,
    valueOnChangeDropdownList,
} from "@/components/Form/formFunctions";
import { EmergencyBagCardProps } from "@/app/emergency-bags/AddEmergencyBagForm";
import FreeFormTextInput from "@/components/DataInput/FreeFormTextInput";

const EMERGENCY_BAG_TYPES = ["Emergency Parcels", "Out of Date Crates", "Other"];

const typeOptions: [string, string][] = EMERGENCY_BAG_TYPES.map((type) => [type, type]);

const TypeOfEmergencyBagCard: React.FC<EmergencyBagCardProps> = ({
    fieldSetter,
    errorSetter,
    formErrors,
    fields,
}) => {
    return (
        <GenericFormCard title="Type of Emergency Bag" required={true}>
            <>
                <ControlledSelect
                    selectLabelId="emergency-bag-type-select-label"
                    labelsAndValues={typeOptions}
                    listTitle="Type"
                    value={fields.type ?? ""}
                    onChange={valueOnChangeDropdownList(fieldSetter, errorSetter, "type")}
                />
                <ErrorText>{getErrorText(formErrors.type)}</ErrorText>

                {fields.type === "Other" && (
                    <FreeFormTextInput
                        id="other-type-information"
                        label="Extra information"
                        defaultValue={getDefaultTextValue(fields, "fullName")}
                        onChange={onChangeText(fieldSetter, errorSetter, "fullName", {
                            required: true,
                        })}
                    />
                )}
            </>
        </GenericFormCard>
    );
};

export default TypeOfEmergencyBagCard;
