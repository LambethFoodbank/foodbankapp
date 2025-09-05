import { ItemsCardProps } from "@/app/clients/form/formSections/PreferredItemsCard";
import SelectionGenericCard from "@/app/clients/form/formSections/SelectionGenericCard";
import React from "react";

const BabyItemsCard: React.FC<ItemsCardProps> = (props) => (
    <SelectionGenericCard
        {...props}
        title="Baby Products"
        fieldName="babyProducts"
        items={props.items.filter((item) => item.type === "baby_product")}
    />
);

export default BabyItemsCard;
