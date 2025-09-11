import { ItemsCardProps } from "@/app/clients/form/formSections/PreferredItemsCard";
import SelectionGenericCard from "@/app/clients/form/formSections/SelectionGenericCard";
import React from "react";

const SeasonalItemsCard: React.FC<ItemsCardProps> = (props) => (
    <SelectionGenericCard
        {...props}
        title="Seasonal Items"
        fieldName="seasonalItems"
        showIfNotAvailable={false}
        items={props.items.filter((item) => item.type === "seasonal_product")}
    />
);

export default SeasonalItemsCard;
