import React from "react";
import {
    FormErrors,
    getErrorText,
    Setter,
    valueOnChangeDropdownList,
} from "@/components/Form/formFunctions";
import GenericFormCard from "@/components/Form/GenericFormCard";
import { ErrorText } from "@/components/Form/formStyling";
import { ControlledSelect } from "@/components/DataInput/DropDownSelect";
import { CollectionCentresLabelsAndValues } from "@/common/fetch";
import {
    EmergencyBagCardProps,
    EmergencyBagFields,
} from "@/app/emergency-bags/form/EmergencyBagForm";

interface HubCardProps extends EmergencyBagCardProps {
    hubLabelsAndValues: CollectionCentresLabelsAndValues;
}
const HubCard: React.FC<HubCardProps> = ({
    fieldSetter,
    errorSetter,
    formErrors,
    fields,
    hubLabelsAndValues,
}) => {
    return (
        <GenericFormCard
            title="Hub"
            required={true}
            text="Which collection centre will receive the emergency bags?"
        >
            <>
                <ControlledSelect
                    selectLabelId="collection-centre-select-label"
                    labelsAndValues={hubLabelsAndValues}
                    listTitle="Hub"
                    value={fields.hub ?? ""}
                    onChange={valueOnChangeDropdownList(
                        fieldSetter,
                        errorSetter as Setter<FormErrors<EmergencyBagFields>>,
                        "hub"
                    )}
                />
                <ErrorText>{getErrorText(formErrors.hub)}</ErrorText>
            </>
        </GenericFormCard>
    );
};

export default HubCard;
