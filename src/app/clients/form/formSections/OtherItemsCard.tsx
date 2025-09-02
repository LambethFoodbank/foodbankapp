import { ItemsCardProps } from "@/app/clients/form/formSections/PreferredItemsCard";
import SelectionGenericCard from "@/app/clients/form/formSections/SelectionGenericCard";
import React from "react";

const PreferredItemsCard: React.FC<ItemsCardProps> = (props) => (
    <SelectionGenericCard
        {...props}
        title="Other Items"
        fieldName="otherItems"
        items={props.items.filter((item) => item.type === "others")}
    />
);

export default PreferredItemsCard;
