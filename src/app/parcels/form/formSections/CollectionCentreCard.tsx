import React, { useMemo } from "react";
import { CollectionCentresLabelsAndValues, DbCollectionCentreType } from "@/common/fetch";
import { ControlledSelect } from "@/components/DataInput/DropDownSelect";
import { getErrorText, valueOnChangeDropdownList } from "@/components/Form/formFunctions";
import { ErrorText } from "@/components/Form/formStyling";
import GenericFormCard from "@/components/Form/GenericFormCard";
import { ParcelCardProps } from "../ParcelForm";

interface CollectionCentreCardProps extends ParcelCardProps {
    collectionCentresLabelsAndValues: CollectionCentresLabelsAndValues;
    availableDays: DbCollectionCentreType[];
}
const CollectionCentreCard: React.FC<CollectionCentreCardProps> = ({
    fieldSetter,
    errorSetter,
    formErrors,
    fields,
    collectionCentresLabelsAndValues,
    availableDays,
}) => {
    const availableDaysNamesArray = availableDays?.map((availableDaysObject) => {
        if (!availableDaysObject) {
            return "No days available";
        }
        return availableDaysObject.available_days
            ?.map((days) => (days.day == undefined ? "" : days.day))
            .join(", ");
    });

    const collectionCentresLabelsAndValuesWithDays: CollectionCentresLabelsAndValues =
        useMemo(() => {
            return collectionCentresLabelsAndValues.map((centre, index) => {
                const [label, value] = centre;
                const daysString =
                    availableDaysNamesArray?.[index] == ""
                        ? "No days available"
                        : availableDaysNamesArray[index];

                return [label + " - " + daysString, value];
            });
        }, [collectionCentresLabelsAndValues, availableDaysNamesArray]);

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
