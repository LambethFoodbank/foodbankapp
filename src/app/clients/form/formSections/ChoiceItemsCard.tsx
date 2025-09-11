import { ItemsCardProps } from "@/app/clients/form/formSections/PreferredItemsCard";
import SelectionGenericCard from "@/app/clients/form/formSections/SelectionGenericCard";
import React from "react";

const ChoiceItemsCard: React.FC<ItemsCardProps> = (props) => (
    <SelectionGenericCard
        {...props}
        title="Items with Options"
        cardDetails="If an item isn't selected or no additional info is provided, a default option will be added to the shopping list."
        fieldName="choiceItems"
        items={props.items.filter((item) => item.type === "choice_food")}
    />
);

export default ChoiceItemsCard;
