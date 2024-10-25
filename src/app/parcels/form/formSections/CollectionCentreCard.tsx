import React from "react";
import { getErrorText, valueOnChangeDropdownList } from "@/components/Form/formFunctions";
import GenericFormCard from "@/components/Form/GenericFormCard";
import { ErrorText } from "@/components/Form/formStyling";
import { ControlledSelect } from "@/components/DataInput/DropDownSelect";
import { CollectionCentresLabelsAndValues } from "@/common/fetch";
import { ParcelCardProps } from "../ParcelForm";

interface CollectionCentreCardProps extends ParcelCardProps {
    collectionCentresLabelsAndValues: CollectionCentresLabelsAndValues;
}
const CollectionCentreCard: React.FC<CollectionCentreCardProps> = ({
    fieldSetter,
    errorSetter,
    formErrors,
    fields,
    collectionCentresLabelsAndValues,
}) => {
    return (
        <GenericFormCard
            title="Collection Centre"
            required={true}
            text="What centre is the client collecting their parcel from?"
        >
            <>
                <ControlledSelect
                    selectLabelId="collection-centre-select-label"
                    labelsAndValues={collectionCentresLabelsAndValues}
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
