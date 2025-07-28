import { GridPreProcessEditCellProps } from "@mui/x-data-grid";
import { phoneNumberRegex, phoneNumberFormatSymbolsRegex, emailRegex, emailFormatSymbolsRegex } from "@/common/format";

export const isPhoneNumberValid = (params: GridPreProcessEditCellProps): boolean => {
    const unformattedInput = params.props.value.replaceAll(phoneNumberFormatSymbolsRegex, "");
    return unformattedInput.match(phoneNumberRegex) === null;
};

export const isEmailValid = (params: GridPreProcessEditCellProps): boolean => {
    const unformattedInput = params.props.value.replaceAll(emailFormatSymbolsRegex, "");
    return unformattedInput.match(emailRegex) === null;
}