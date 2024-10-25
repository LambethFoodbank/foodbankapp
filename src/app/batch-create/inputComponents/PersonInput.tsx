import {
    getAdultBirthYears,
    getChildBirthYears,
    getCurrentYearChildBirthMonthList,
} from "@/app/clients/form/birthYearDropdown";
import { ControlledSelect, UncontrolledSelect } from "@/components/DataInput/DropDownSelect";
import { Gender, Person } from "@/components/Form/formFunctions";
import { GappedDiv } from "@/components/Form/formStyling";
import styled from "styled-components";
import { PersonField } from "@/app/batch-create/inputComponents/PersonEditCell";
import { Divider } from "@mui/material";
import { BatchActionType } from "@/app/batch-create/types";
import dayjs from "dayjs";

interface PersonInputProps {
    people: Person[];
    setPeople: React.Dispatch<React.SetStateAction<Person[]>>;
    index: number;
    personField: PersonField;
    dispatchBatchTableAction: React.Dispatch<BatchActionType>;
    id: number;
    dispatchPerson: (newPerson: Person[]) => void;
}

const GappedDivTopMargin = styled(GappedDiv)`
    margin-top: 0.5rem;
    padding: 0.5rem;
`;

const PersonInput: React.FC<PersonInputProps> = ({
    people,
    setPeople,
    index,
    personField,
    dispatchBatchTableAction,
    id,
    dispatchPerson,
}) => {
    const yearLabelsAndValues: [string, string][] =
        personField === "adultInfo"
            ? getAdultBirthYears().map((year) => [`${year}`, `${year}`] as [string, string])
            : getChildBirthYears().map((year) => [`${year}`, `${year}`] as [string, string]);
    const genderLabelsAndValues: [string, string][] = [
        ["Male", "male"],
        ["Female", "female"],
        ["Prefer Not To Say", "other"],
    ];
    const defaultMonthString: string = people[index].birthMonth
        ? `${dayjs(people[index].birthMonth + 1).month()}`
        : "";

    const peopleCopy = people.slice();

    return (
        <GappedDivTopMargin>
            <Divider variant="middle" />
            <UncontrolledSelect
                selectLabelId="adult-gender-select-label"
                labelsAndValues={genderLabelsAndValues}
                listTitle="Gender *"
                defaultValue={people[index].gender}
                onChange={(event) => {
                    peopleCopy[index].gender = event.target.value as Gender;
                    setPeople(peopleCopy);
                    dispatchPerson(people);
                }}
            />
            <UncontrolledSelect
                selectLabelId="adult-birth-year-select-label"
                labelsAndValues={yearLabelsAndValues}
                listTitle="Year of Birth"
                defaultValue={people[index].birthYear}
                onChange={(event) => {
                    peopleCopy[index].birthYear = +(event.target.value as string);
                    setPeople(peopleCopy);
                    dispatchPerson(people);
                }}
            />
            {personField === "childrenInfo" && (
                <ControlledSelect
                    selectLabelId="adult-birth-month-select-label"
                    labelsAndValues={getCurrentYearChildBirthMonthList()}
                    listTitle="Month of birth"
                    value={defaultMonthString}
                    onChange={(event) => {
                        peopleCopy[index].birthMonth = +(event.target.value as string);
                        setPeople(peopleCopy);
                        dispatchBatchTableAction({
                            type: "update_cell",
                            updateCellPayload: {
                                rowId: id,
                                newValueAndFieldName: {
                                    type: "client",
                                    fieldName: personField,
                                    newValue: {
                                        children: people,
                                        numberOfChildren: people.length,
                                    },
                                },
                            },
                        });
                    }}
                />
            )}
        </GappedDivTopMargin>
    );
};

export default PersonInput;
