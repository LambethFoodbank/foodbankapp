import React from "react";
import { CollectionCentresLabelsAndValues, DbCollectionCentreType } from "@/common/fetch";
import { ControlledSelect } from "@/components/DataInput/DropDownSelect";
import { getErrorText, valueOnChangeDropdownList } from "@/components/Form/formFunctions";
import { ErrorText } from "@/components/Form/formStyling";
import GenericFormCard from "@/components/Form/GenericFormCard";
import { ParcelCardProps } from "../ParcelForm";

interface CollectionCentreCardProps extends ParcelCardProps {
    collectionCentresLabelsAndValues: CollectionCentresLabelsAndValues;
    collectionAvailableDays: DbCollectionCentreType[];
}

const CollectionCentreCard: React.FC<CollectionCentreCardProps> = ({
    fieldSetter,
    errorSetter,
    formErrors,
    fields,
    collectionCentresLabelsAndValues,
    collectionAvailableDays,
}) => {
    const availableDaysNamesArray = collectionAvailableDays?.map((availableDaysObject) => {
        if (!availableDaysObject) {
            return "This centre is closed all week";
        }
        return availableDaysObject.available_days
            ?.filter((collectionDay) => collectionDay.is_active)
            ?.map((collectionDay) => (collectionDay.day == undefined ? "" : collectionDay.day))
            .join(", ");
    });

    const collectionCentresLabelsAndValuesWithDays: CollectionCentresLabelsAndValues =
        collectionCentresLabelsAndValues.map((centre, index) => {
            const [label, value] = centre;
            const daysString =
                availableDaysNamesArray?.[index] == ""
                    ? "This centre is closed all week"
                    : availableDaysNamesArray[index];

            return [label + " - " + daysString, value];
        });

    return (
        <GenericFormCard
            title="Collection Centre"
            required={true}
            text="What centre is the client collecting their parcel from?"
        >
            <>
                <ControlledSelect
                    selectLabelId="collection-centre-select-label"
                    labelsAndValues={collectionCentresLabelsAndValuesWithDays}
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
