import { Dayjs } from "dayjs";
import { phoneNumberFormatSymbolsRegex, formatPhoneNumber } from "@/common/format";
import {
    BooleanGroup,
    ChangeEventHandler,
    SelectChangeEventHandler,
} from "@/components/DataInput/inputHandlerFactories";
import { Database } from "@/databaseTypesFile";

export type Setter<SpecificFields extends Fields> = (
    fieldValuesToUpdate: Partial<SpecificFields>
) => void;
export type Gender = Database["public"]["Enums"]["gender"];

export enum Errors {
    initial = "required",
    none = "",
    required = "This is a required field.",
    invalid = "Please enter a valid entry.",
    submit = "Please ensure all fields have been entered correctly. Required fields are labelled with an asterisk.",
    external = "Please try again later.",
    pastDate = "Please enter a date in the future.",
    tooLong = "The text is too long, reduce the number of characters.",
    invalidPackingSlot = "The previous packing slot is no longer available, please select a new packing slot.",
    invalidCollectionCentre = "The previous collection centre is no longer available, please select a new collection centre.",
    invalidCollectionDate = "The previous collection date is no longer available, please select a new collection date.",
    invalidCollectionSlot = "The previous timeslot is no longer available, please select a new timeslot.",
    noCollectionSlotsSet = "There are no collection slots set for this collection centre, please select a different collection centre or contact admin.",
    phoneNumberAlreadyExists = "This phone number already exists, please add a different phone number.",
    emptyPrimaryPhoneNumber = "The primary phone number should be filled in before adding other phone number.",
    emptyPreviousPhoneNumber = "The previous phone number should be filled before adding another phone number.",
}

export const numberRegex = /^\d+$/;

export interface CardProps<
    SpecificFields extends Fields,
    SpecificErrors extends FormErrors<SpecificFields>,
> {
    formErrors: SpecificErrors;
    errorSetter: Setter<SpecificErrors>;
    fieldSetter: Setter<SpecificFields>;
    fields: SpecificFields;
}

export interface Person {
    gender?: Gender | null;
    birthYear?: number | null;
    birthMonth?: number | null;
    recordedAsChild?: boolean | null;
    primaryKey?: string;
}

export type Fields = Record<string, unknown>;

export type FormErrors<SpecificFields extends Fields> = {
    [errorKey in keyof SpecificFields]?: Errors | Errors[];
};

export const createSetter = <SpecificFields extends Fields>(
    setFields: (SpecificFields: SpecificFields) => void,
    fieldValues: SpecificFields
): Setter<SpecificFields> => {
    return (fieldValuesToUpdate: Partial<SpecificFields>): void => {
        setFields({ ...fieldValues, ...fieldValuesToUpdate });
    };
};

export const getPhoneNumbersErrorType = (
    input: string,
    currentAdditionalPhoneNumbers?: string[] | null,
    primaryPhoneNumber?: string | null,
    index?: number
): Errors => {
    const additionalNumbers = currentAdditionalPhoneNumbers || [];
    const isEditingPrimaryPhone = index === undefined;
    const isInputEmpty = input === "";
    const formattedInput = formatPhoneNumber(input);

    if (isEditingPrimaryPhone && isInputEmpty && additionalNumbers.length > 0) {
        return Errors.emptyPrimaryPhoneNumber;
    }

    if (isInputEmpty) {
        return Errors.none;
    }

    const isDuplicateOfOtherAdditional = additionalNumbers.some(
        (phoneNumber, ind) => phoneNumber === formattedInput && ind !== index
    );

    const isDuplicateOfPrimaryPhone =
        primaryPhoneNumber &&
        primaryPhoneNumber !== formattedInput &&
        formattedInput === formatPhoneNumber(primaryPhoneNumber);

    return isDuplicateOfPrimaryPhone || isDuplicateOfOtherAdditional
        ? Errors.phoneNumberAlreadyExists
        : Errors.none;
};

export const getErrorType = (
    input: string,
    required?: boolean,
    regex?: RegExp,
    additionalCondition?: (value: string) => boolean,
    maxCharacters?: number
): Errors => {
    if (input == "") {
        return required ? Errors.required : Errors.none;
    }
    if (
        (regex !== undefined && !input.match(regex)) ||
        (additionalCondition !== undefined && !additionalCondition(input))
    ) {
        return Errors.invalid;
    }

    if (maxCharacters !== undefined && input.length > maxCharacters) {
        return Errors.tooLong;
    }

    return Errors.none;
};

interface OnChangeTextOptions<SpecificFields> {
    required?: boolean;
    regex?: RegExp;
    formattingFunction?: (value: string) => SpecificFields[keyof SpecificFields];
    additionalCondition?: (value: string) => boolean;
    maxCharacters?: number;
}

const callErrorAndFieldSetters = <SpecificFields extends Fields>(
    fieldSetter: Setter<SpecificFields>,
    errorSetter: Setter<FormErrors<SpecificFields>> | Setter<Required<FormErrors<SpecificFields>>>,
    key: keyof SpecificFields,
    errorType: Errors,
    input: string,
    options?: OnChangeTextOptions<SpecificFields>
): void => {
    errorSetter({ [key]: errorType } as Partial<FormErrors<SpecificFields>>);
    if (errorType === Errors.none) {
        const newValue = options?.formattingFunction ? options.formattingFunction(input) : input;
        fieldSetter({ [key]: newValue } as {
            [key in keyof SpecificFields]: SpecificFields[key];
        });
    }
};

export const onChangePhoneNumbers = <SpecificFields extends Fields>(
    fieldSetter: Setter<SpecificFields>,
    primaryPhoneNumber: string | null,
    currentAdditionalPhoneNumbers: string[] | null,
    errorSetter: Setter<FormErrors<SpecificFields>> | Setter<Required<FormErrors<SpecificFields>>>,
    key: keyof SpecificFields,
    currentFormErrors: FormErrors<SpecificFields> | Required<FormErrors<SpecificFields>>,
    options?: OnChangeTextOptions<SpecificFields>,
    index?: number
): SelectChangeEventHandler => {
    return (event) => {
        const input = event.target.value;
        let errorType = getErrorType(
            input.replaceAll(phoneNumberFormatSymbolsRegex, ""),
            options?.required,
            options?.regex,
            options?.additionalCondition,
            options?.maxCharacters
        );

        if (errorType === Errors.none) {
            const cleanedInput = input.replaceAll(phoneNumberFormatSymbolsRegex, "");
            const includeIndex = !(key === "telephoneNumber" || key === "phoneNumber");

            errorType = includeIndex
                ? getPhoneNumbersErrorType(
                      cleanedInput,
                      currentAdditionalPhoneNumbers,
                      primaryPhoneNumber,
                      index
                  )
                : getPhoneNumbersErrorType(
                      cleanedInput,
                      currentAdditionalPhoneNumbers,
                      primaryPhoneNumber
                  );
        }

        if (key === "additionalPhoneNumbers" && index !== undefined) {
            const currentErrors = Array.isArray(
                (currentFormErrors as Record<string, Errors[]>)["additionalPhoneNumbers"]
            )
                ? [...(currentFormErrors as Record<string, Errors[]>)["additionalPhoneNumbers"]]
                : ([] as Errors[]);

            while (currentErrors.length <= index) {
                currentErrors.push(Errors.none);
            }

            currentErrors[index] = errorType;

            errorSetter({
                [key]: currentErrors,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } as { [key in keyof FormErrors<SpecificFields>]: any });

            if (errorType === Errors.none) {
                const newValue = options?.formattingFunction
                    ? options.formattingFunction(input)
                    : input;

                const updatedArray = [...(currentAdditionalPhoneNumbers || [])];
                updatedArray[index] = newValue as string;
                fieldSetter({ [key]: updatedArray } as {
                    [key in keyof SpecificFields]: SpecificFields[key];
                });
            }
        } else {
            callErrorAndFieldSetters(fieldSetter, errorSetter, key, errorType, input, options);
        }
    };
};

export const onChangeText = <SpecificFields extends Fields>(
    fieldSetter: Setter<SpecificFields>,
    errorSetter: Setter<FormErrors<SpecificFields>> | Setter<Required<FormErrors<SpecificFields>>>,
    key: keyof SpecificFields,
    options?: OnChangeTextOptions<SpecificFields>
): SelectChangeEventHandler => {
    return (event) => {
        const input = event.target.value;
        const errorType = getErrorType(
            input,
            options?.required,
            options?.regex,
            options?.additionalCondition,
            options?.maxCharacters
        );
        callErrorAndFieldSetters(fieldSetter, errorSetter, key, errorType, input, options);
    };
};

export const onChangeTextDeferredError = <SpecificFields extends Fields>(
    fieldSetter: Setter<SpecificFields>,
    errorSetter: Setter<FormErrors<SpecificFields>> | Setter<Required<FormErrors<SpecificFields>>>,
    key: keyof SpecificFields,
    required?: boolean,
    regex?: RegExp,
    clearInvitedUser?: () => void,
    formattingFunction?: (value: string) => SpecificFields[keyof SpecificFields],
    additionalCondition?: (value: string) => boolean,
    maxCharacters?: number
): SelectChangeEventHandler => {
    return (event) => {
        if (clearInvitedUser) {
            clearInvitedUser();
        }
        const input = event.target.value;
        const errorType = getErrorType(input, required, regex, additionalCondition, maxCharacters);
        errorSetter({ [key]: errorType } as Partial<FormErrors<SpecificFields>>);
        const newValue = formattingFunction ? formattingFunction(input) : input;
        fieldSetter({ [key]: newValue } as {
            [key in keyof SpecificFields]: SpecificFields[key];
        });
    };
};

export const onChangeCheckboxInGroup = <SpecificFields extends Fields>(
    fieldSetter: Setter<SpecificFields>,
    currentObject: BooleanGroup,
    key: string
): ChangeEventHandler => {
    return (event) => {
        const newObject = { ...currentObject, [event.target.name]: event.target.checked };
        fieldSetter({ [key]: newObject } as { [key in keyof SpecificFields]: SpecificFields[key] });
    };
};

export const onChangeSingleCheckbox = <SpecificFields extends Fields>(
    fieldSetter: Setter<SpecificFields>,
    key: string
): ChangeEventHandler => {
    return (event) => {
        fieldSetter({ [key]: event.target.checked } as {
            [key in keyof SpecificFields]: SpecificFields[key];
        });
    };
};

export const onChangeRadioGroup = <SpecificFields extends Fields>(
    fieldSetter: Setter<SpecificFields>,
    key: string
): SelectChangeEventHandler => {
    return (event) => {
        const input = event.target.value;
        fieldSetter({ [key]: input === "Yes" } as {
            [key in keyof SpecificFields]: SpecificFields[key];
        });
    };
};

export const valueOnChangeRadioGroup = <SpecificFields extends Fields>(
    fieldSetter: Setter<SpecificFields>,
    errorSetter: Setter<FormErrors<SpecificFields>> | Setter<Required<FormErrors<SpecificFields>>>,
    key: string
): SelectChangeEventHandler => {
    return (event) => {
        const input = event.target.value;
        fieldSetter({ [key]: input } as { [key in keyof SpecificFields]: SpecificFields[key] });
        errorSetter({ [key]: Errors.none } as Partial<FormErrors<SpecificFields>>);
    };
};

export const valueOnChangeDropdownList = <SpecificFields extends Fields>(
    fieldSetter: Setter<SpecificFields>,
    errorSetter: Setter<FormErrors<SpecificFields>> | Setter<Required<FormErrors<SpecificFields>>>,
    key: string
): SelectChangeEventHandler => {
    return (event) => {
        const input = event.target.value;
        fieldSetter({ [key]: input } as { [key in keyof SpecificFields]: SpecificFields[key] });
        errorSetter({ [key]: Errors.none } as Partial<FormErrors<SpecificFields>>);
    };
};

export const onChangeDateOrTime = <SpecificFields extends Fields>(
    fieldSetter: Setter<SpecificFields>,
    errorSetter: Setter<FormErrors<SpecificFields>> | Setter<Required<FormErrors<SpecificFields>>>,
    key: string,
    value: Dayjs | null
): void => {
    if (value === null || isNaN(Date.parse(value.toString()))) {
        fieldSetter({ [key]: null } as { [key in keyof SpecificFields]: SpecificFields[key] });
        errorSetter({ [key]: Errors.invalid } as Partial<FormErrors<SpecificFields>>);

        return;
    }
    fieldSetter({ [key]: value } as { [key in keyof SpecificFields]: SpecificFields[key] });
    errorSetter({ [key]: Errors.none } as Partial<FormErrors<SpecificFields>>);
};

export const onChangeDate = <SpecificFields extends Fields>(
    fieldSetter: Setter<SpecificFields>,
    errorSetter: Setter<FormErrors<SpecificFields>> | Setter<Required<FormErrors<SpecificFields>>>,
    key: string,
    value: Dayjs | null
): void => {
    onChangeDateOrTime(fieldSetter, errorSetter, key, value);
    if (value === null || isNaN(Date.parse(value.toString()))) {
        return;
    }
};

export const errorExists = (errorType: Errors): boolean => {
    return errorType !== Errors.initial && errorType !== Errors.none;
};

export const getErrorText = (errorType: Errors, maxCharacters?: number): string => {
    switch (errorType) {
        case Errors.initial: {
            return Errors.none;
        }
        case Errors.tooLong: {
            const additionalInfo =
                maxCharacters === undefined ? "" : `Maximum ${maxCharacters} characters.`;
            return `${Errors.tooLong} ${additionalInfo}`;
        }
        default: {
            return errorType;
        }
    }
};

export const sortArrayByCanonicalOrder = (
    listToSort: string[],
    canonicalOrder: string[]
): string[] => {
    return listToSort.sort((firstKey, secondKey) => {
        const firstIndex = canonicalOrder.indexOf(firstKey);
        const secondIndex = canonicalOrder.indexOf(secondKey);

        // Unrecognised strings to the end, in alphabetical order
        if (firstIndex === -1) {
            if (secondIndex === -1) {
                if (firstKey < secondKey) {
                    return -1;
                } else if (firstKey > secondKey) {
                    return 1;
                } else {
                    return 0;
                }
            } else {
                return 1;
            }
        } else if (firstIndex !== -1 && secondIndex === -1) {
            return -1;
        }

        return firstIndex - secondIndex;
    });
};

export const checkboxGroupToArray = (checkedBoxes: BooleanGroup): string[] => {
    return Object.keys(checkedBoxes).filter((key) => checkedBoxes[key]);
};

export const checkErrorOnSubmit = <
    SpecificFields extends Fields,
    SpecificErrors extends FormErrors<SpecificFields>,
>(
    errorType: SpecificErrors,
    errorSetter: (errors: SpecificErrors) => void,
    keysToCheck?: string[]
): boolean => {
    let errorExists = false;
    let amendedErrorTypes = { ...errorType };

    for (const [errorKey, error] of Object.entries(errorType)) {
        if (!keysToCheck || keysToCheck.includes(errorKey)) {
            // Handle array of errors for additionalPhoneNumbers
            if (Array.isArray(error)) {
                const hasError = error.some((err) => err !== Errors.none);
                if (hasError) {
                    errorExists = true;
                }
                const updatedErrors = error.map((err) =>
                    err === Errors.initial ? Errors.required : err
                );
                const needsUpdate =
                    !error.every((err, index) => err === updatedErrors[index]) ||
                    updatedErrors !== error;

                if (needsUpdate) {
                    amendedErrorTypes = {
                        ...amendedErrorTypes,
                        [errorKey]: updatedErrors,
                    };
                }
            } else if (error !== Errors.none) {
                errorExists = true;
                if (error === Errors.initial) {
                    amendedErrorTypes = {
                        ...amendedErrorTypes,
                        [errorKey]: Errors.required,
                    };
                }
            }
        }
    }

    if (errorExists) {
        errorSetter(amendedErrorTypes);
    }
    return errorExists;
};

// This function is not type safe, but I don't have the context to fix it right now
export const getDefaultTextValue = (fields: Fields, fieldKey: keyof Fields): string | undefined => {
    return (fields[fieldKey] as string) ?? undefined;
};
