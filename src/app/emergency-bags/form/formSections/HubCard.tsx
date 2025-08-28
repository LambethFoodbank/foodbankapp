import React from "react";
import { getErrorText, valueOnChangeDropdownList } from "@/components/Form/formFunctions";
import GenericFormCard from "@/components/Form/GenericFormCard";
import { ErrorText } from "@/components/Form/formStyling";
import { ControlledSelect } from "@/components/DataInput/DropDownSelect";
import { CollectionCentresLabelsAndValues } from "@/common/fetch";
import { EmergencyBagCardProps } from "@/app/emergency-bags/AddEmergencyBagForm";

interface HubCardProps extends EmergencyBagCardProps {
    hubLabelsAndValues: CollectionCentresLabelsAndValues;
}
const CollectionCentreCard: React.FC<HubCardProps> = ({
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
                    listTitle="Collection Centre"
                    value={fields.collectionCentre ?? ""}
                    onChange={valueOnChangeDropdownList(
                        fieldSetter,
                        errorSetter,
                        "collectionCentre"
                    )}
                />
                <ErrorText>{getErrorText(formErrors.collectionCentre)}</ErrorText>
            </>
        </GenericFormCard>
    );
};

export default CollectionCentreCard;
