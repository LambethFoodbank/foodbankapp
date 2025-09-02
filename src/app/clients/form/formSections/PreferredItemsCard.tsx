import SelectionGenericCard from "@/app/clients/form/formSections/SelectionGenericCard";
import React from "react";
import { Item } from "@/components/Form/formFunctions";
import { ClientCardProps } from "../ClientForm";

export interface ItemsCardProps extends ClientCardProps {
    items: Item[];
}

const PreferredItemsCard: React.FC<ItemsCardProps> = (props) => (
    <SelectionGenericCard
        {...props}
        title="Preferred Items"
        fieldName="preferredItems"
        items={props.items.filter((item) => item.type === "alternative_food")}
    />
);

export default PreferredItemsCard;
