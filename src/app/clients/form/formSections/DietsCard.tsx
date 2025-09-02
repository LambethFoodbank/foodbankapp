import SelectionGenericCard from "@/app/clients/form/formSections/SelectionGenericCard";
import React from "react";
import { Diet } from "@/components/Form/formFunctions";
import { ClientCardProps } from "../ClientForm";

interface DietsCardProps extends ClientCardProps {
    diets: Diet[];
}

const DietsCard: React.FC<DietsCardProps> = (props) => (
    <SelectionGenericCard {...props} title="Diets" fieldName="diets" items={props.diets} />
);

export default DietsCard;
