import { ItemsCardProps } from "@/app/clients/form/formSections/PreferredItemsCard";
import SelectionGenericCard from "@/app/clients/form/formSections/SelectionGenericCard";
import React from "react";

const PetFoodCard: React.FC<ItemsCardProps> = (props) => (
    <SelectionGenericCard
        {...props}
        title="Pet Food"
        fieldName="petFood"
        items={props.items.filter((item) => item.type === "pet_food")}
    />
);

export default PetFoodCard;
