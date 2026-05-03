import React, { useEffect } from "react";
import FreeFormTextInput from "@/components/DataInput/FreeFormTextInput";
import {
    errorExists,
    getErrorText,
    numberRegex,
    Person,
    Gender,
    onChangeText,
    Setter,
    FormErrors,
} from "@/components/Form/formFunctions";
import GenericFormCard from "@/components/Form/GenericFormCard";
import { SelectChangeEventHandler } from "@/components/DataInput/inputHandlerFactories";
import { FormText, StyledCard } from "@/components/Form/formStyling";
import { ClientCardProps, ClientFields, ClientSetter } from "@/app/clients/form/ClientForm";
import { ControlledSelect } from "@/components/DataInput/DropDownSelect";
import { getAdultBirthYears } from "@/app/clients/form/birthYearDropdown";
import { MAXIMUM_NUMBER_OF_ADULTS, MINIMUM_NUMBER_OF_ADULTS } from "@/app/clients/form/bounds";
import {
    genderSelectValueForUnknown,
    getGenderSelectLabelsAndValues,
} from "@/common/getGendersOfFamily";

const numberOfAdultsRange = (value: string): boolean => {
    return (
        parseInt(value) <= MAXIMUM_NUMBER_OF_ADULTS && parseInt(value) >= MINIMUM_NUMBER_OF_ADULTS
    );
};

export const resizePersonsArray = (
    currentArray: Person[],
    targetLength: number,
    isChildArray: boolean
): Person[] => {
    if (currentArray.length === targetLength) {
        return currentArray;
    }

    return currentArray.length < targetLength
        ? [
              ...currentArray,
              ...Array(targetLength - currentArray.length).fill({
                  recordedAsChild: isChildArray,
              } as Person),
          ]
        : currentArray.slice(0, targetLength);
};

const setAdultsFields = (
    fieldSetter: ClientSetter,
    adults: Person[],
    index: number,
    subFieldName: "gender" | "birthYear"
): SelectChangeEventHandler => {
    return (event) => {
        const input = event.target.value;
        switch (subFieldName) {
            case "gender":
                adults[index][subFieldName] = (
                    input !== genderSelectValueForUnknown ? input : null
                ) as Gender | null;
                break;
            case "birthYear":
                adults[index][subFieldName] = parseInt(input);
                break;
        }
        fieldSetter({ adults: [...adults] });
    };
};

const NumberAdultsCard: React.FC<ClientCardProps> = ({
    formErrors,
    errorSetter,
    fieldSetter,
    fields,
}) => {
    useEffect(() => {
        const resized = resizePersonsArray(fields.adults, fields.numberOfAdults, false);
        if (resized !== fields.adults) {
            fieldSetter({ adults: resized });
        }
    }, [fields.numberOfAdults, fields.adults, fieldSetter]);

    return (
        <GenericFormCard
            title="Number of Adults"
            required={true}
            text="Please enter a number between 1 and 20. (Note that adults are aged 16 or above)."
        >
            <>
                <FreeFormTextInput
                    id="client-number-adults"
                    label="Number of Adults"
                    defaultValue={
                        fields.numberOfAdults !== 0 ? fields.numberOfAdults.toString() : undefined
                    }
                    error={errorExists(formErrors.numberOfAdults)}
                    helperText={getErrorText(formErrors.numberOfAdults)}
                    onChange={onChangeText(
                        fieldSetter,
                        errorSetter as Setter<FormErrors<ClientFields>>,
                        "numberOfAdults",
                        {
                            required: true,
                            regex: numberRegex,
                            formattingFunction: parseInt,
                            additionalCondition: numberOfAdultsRange,
                        }
                    )}
                />
                {fields.adults
                    .slice(0, fields.numberOfAdults)
                    .map((adult: Person, index: number) => (
                        <StyledCard key={adult.primaryKey ?? `new-adult-${index}`}>
                            <FormText>Adult {index + 1}</FormText>
                            <ControlledSelect
                                selectLabelId="adult-gender-select-label"
                                labelsAndValues={getGenderSelectLabelsAndValues()}
                                listTitle="Gender"
                                value={adult.gender ?? genderSelectValueForUnknown}
                                onChange={setAdultsFields(
                                    fieldSetter,
                                    fields.adults,
                                    index,
                                    "gender"
                                )}
                            />
                            <ControlledSelect
                                selectLabelId="adult-birth-year-select-label"
                                labelsAndValues={getAdultBirthYears().map((year) => [
                                    `${year}`,
                                    `${year}`,
                                ])}
                                listTitle="Year of Birth"
                                value={adult.birthYear?.toString() ?? ""}
                                onChange={setAdultsFields(
                                    fieldSetter,
                                    fields.adults,
                                    index,
                                    "birthYear"
                                )}
                            />
                        </StyledCard>
                    ))}
            </>
        </GenericFormCard>
    );
};

export default NumberAdultsCard;
