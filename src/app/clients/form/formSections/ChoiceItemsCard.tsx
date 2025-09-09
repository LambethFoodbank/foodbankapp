import { ItemsCardProps } from "@/app/clients/form/formSections/PreferredItemsCard";
import SelectionGenericCard from "@/app/clients/form/formSections/SelectionGenericCard";
import React from "react";

const ChoiceItemsCard: React.FC<ItemsCardProps> = (props) => (
    <SelectionGenericCard
        {...props}
        title="Items with Options"
        fieldName="choiceItems"
        items={props.items.filter((item) => item.type === "choice_food")}
    />
);

export default ChoiceItemsCard;
