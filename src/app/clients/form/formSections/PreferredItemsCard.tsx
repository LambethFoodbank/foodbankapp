import SelectionGenericCard from "@/app/clients/form/formSections/SelectionGenericCard";
import React from "react";
import { Item } from "@/components/Form/formFunctions";
import { ClientCardProps } from "../ClientForm";

interface PreferredItemsCardProps extends ClientCardProps {
    items: Item[];
}

const PreferredItemsCard: React.FC<PreferredItemsCardProps> = (props) => (
    <SelectionGenericCard
        {...props}
        title="Preferred Items"
        fieldName="preferredItems"
        items={props.items}
    />
);

export default PreferredItemsCard;
