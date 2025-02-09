import React, { useState } from "react";
import {
    getDefaultTextValue,
    onChangeSingleCheckbox,
    onChangeText,
} from "@/components/Form/formFunctions";
import GenericFormCard from "@/components/Form/GenericFormCard";
import { ClientCardProps } from "../ClientForm";
import { Checkbox, FormControlLabel, FormGroup } from "@mui/material";
import FreeFormTextInput from "@/components/DataInput/FreeFormTextInput";

const HygieneProductsCard: React.FC<ClientCardProps> = ({ errorSetter, fieldSetter, fields }) => {
    const [tamponsRequired, setTamponsRequired] = useState(
        fields["hygieneProductsTampons"] !== null
    );
    const [padsRequired, setPadsRequired] = useState(fields["hygieneProductsPads"] !== null);

    const handleTamponsCheckbox = (event: React.ChangeEvent<HTMLInputElement>): void => {
        setTamponsRequired(event.target.checked);

        if (!event.target.checked) {
            fieldSetter({ hygieneProductsTampons: null });
        }
    };

    const handlePadsCheckbox = (event: React.ChangeEvent<HTMLInputElement>): void => {
        setPadsRequired(event.target.checked);

        if (!event.target.checked) {
            fieldSetter({ hygieneProductsPads: null });
        }
    };

    return (
        <GenericFormCard title="Hygiene Products" required={false}>
            <FormGroup>
                <FormControlLabel
                    control={
                        <Checkbox checked={tamponsRequired} onChange={handleTamponsCheckbox} />
                    }
                    label="Tampons"
                />
                {tamponsRequired && (
                    <FreeFormTextInput
                        label="How Many"
                        defaultValue={getDefaultTextValue(fields, "hygieneProductsTampons")}
                        onChange={onChangeText(fieldSetter, errorSetter, "hygieneProductsTampons", {
                            required: false,
                        })}
                    />
                )}

                <FormControlLabel
                    control={<Checkbox checked={padsRequired} onChange={handlePadsCheckbox} />}
                    label="Pads"
                />
                {padsRequired && (
                    <FreeFormTextInput
                        label="How Many"
                        defaultValue={getDefaultTextValue(fields, "hygieneProductsPads")}
                        onChange={onChangeText(fieldSetter, errorSetter, "hygieneProductsPads", {
                            required: false,
                        })}
                    />
                )}

                <FormControlLabel
                    control={
                        <Checkbox
                            checked={fields.hygieneProductsFemaleIncontinence}
                            onChange={onChangeSingleCheckbox(
                                fieldSetter,
                                "hygieneProductsFemaleIncontinence"
                            )}
                        />
                    }
                    label="Female Incontinence Pads"
                />

                <FormControlLabel
                    control={
                        <Checkbox
                            checked={fields.hygieneProductsMaleIncontinence}
                            onChange={onChangeSingleCheckbox(
                                fieldSetter,
                                "hygieneProductsMaleIncontinence"
                            )}
                        />
                    }
                    label="Male Incontinence Pads"
                />
            </FormGroup>
        </GenericFormCard>
    );
};

export default HygieneProductsCard;
