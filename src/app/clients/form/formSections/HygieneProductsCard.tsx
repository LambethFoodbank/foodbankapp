import { ItemsCardProps } from "@/app/clients/form/formSections/PreferredItemsCard";
import SelectionGenericCard from "@/app/clients/form/formSections/SelectionGenericCard";
import React from "react";

const HygieneItemsCard: React.FC<ItemsCardProps> = (props) => (
    <SelectionGenericCard
        {...props}
        title="Hygiene Products"
        fieldName="hygieneProducts"
        items={props.items.filter((item) => item.type === "hygiene_product")}
    />
);

export default HygieneItemsCard;
