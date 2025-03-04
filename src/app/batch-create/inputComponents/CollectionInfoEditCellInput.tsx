import { CenterComponent } from "@/components/Form/formStyling";
import { Button, Checkbox, FormControlLabel } from "@mui/material";
import { useCallback, useEffect, useMemo, useState } from "react";
import { BatchActionType, BatchTableDataState, CollectionInfo } from "@/app/batch-create/types";
import { COLLECTION_INFO_WIDTH } from "@/app/batch-create/columnWidths";
import { ControlledSelect } from "@/components/DataInput/DropDownSelect";
import {
    CollectionCentresTableRow,
    fetchCollectionCentresForTable,
} from "@/app/admin/collectionCentresTable/CollectionCentreActions";
import { logErrorReturnLogId } from "@/logger/logger";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs, { Dayjs } from "dayjs";
import { EditCellGappedDivMargin } from "@/app/batch-create/inputComponents/EditCellStyledComponents";
import { getCurrentShippingMethodString } from "@/app/batch-create/inputComponents/ShippingMethodEditCell";

export interface CollectionInfoEditCellInputProps {
    id: number;
    dispatchBatchTableAction: React.Dispatch<BatchActionType>;
    currentCollectionInfo: CollectionInfo | null;
    isRowCollection: { [key: number]: boolean };
    setIsRowCollection: React.Dispatch<React.SetStateAction<{ [key: number]: boolean }>>;
    tableState: BatchTableDataState;
}

const CollectionInfoEditCellInput: React.FC<CollectionInfoEditCellInputProps> = ({
    id,
    dispatchBatchTableAction,
    currentCollectionInfo,
    isRowCollection,
    setIsRowCollection,
    tableState,
}) => {
    const [parcelHasNoCollectionCentre, setParcelHasNoCollectionCentre] = useState<boolean>(false);

    const [fieldCollectionCentreId, setFieldCollectionCentreId] = useState<string | null>(
        currentCollectionInfo?.collectionCentreId ?? null
    );
    const [fieldCollectionCentreName, setFieldCollectionCentreName] = useState<string | null>(
        currentCollectionInfo?.collectionCentreName ?? null
    );
    const [fieldCollectionCentreAcronym, setFieldCollectionCentreAcronym] = useState<string | null>(
        currentCollectionInfo?.collectionCentreAcronymn ?? null
    );
    const [fieldCollectionSlot, setFieldCollectionSlot] = useState<string | null>(
        currentCollectionInfo?.collectionSlot ?? null
    );
    const [fieldCollectionDate, setFieldCollectionDate] = useState<string | null>(
        currentCollectionInfo?.collectionDate ?? null
    );
    const [collectionCentres, setCollectionCentres] = useState<CollectionCentresTableRow[]>([]);

    const [isfieldCollectionCentreEmpty, setIsFieldCollectionCentreEmpty] =
        useState<boolean>(false);
    const [isfieldCollectionSlotEmpty, setIsFieldCollectionSlotEmpty] = useState<boolean>(false);

    const currentShippingMethodString: string = useMemo(
        () => getCurrentShippingMethodString(id, tableState),
        [id, tableState]
    );

    useEffect(() => {
        setIsRowCollection((isRowCollection) => {
            const newIsRowCollection = { ...isRowCollection };
            newIsRowCollection[id] =
                getCurrentShippingMethodString(id, tableState) === "Collection";
            return newIsRowCollection;
        });

        const setCurrentCollectionCentres = async (): Promise<void> => {
            const { data, error } = await fetchCollectionCentresForTable();
            error
                ? logErrorReturnLogId("Error fetching data from collection centres: ", error)
                : setCollectionCentres(
                      data.filter((collectionCentre) => {
                          return collectionCentre.name != "Delivery";
                      })
                  );
        };
        setCurrentCollectionCentres();
    }, [currentShippingMethodString, id, setIsRowCollection, setCollectionCentres, tableState]);

    const handleCheckCheckbox = (event: React.ChangeEvent<HTMLInputElement>): void => {
        setParcelHasNoCollectionCentre(event.target.checked);
    };

    const collectionCentresNamesLabelsAndValues: [string, string][] = collectionCentres.map(
        (collectionCentre) => {
            return [collectionCentre.name, collectionCentre.id];
        }
    );

    const currentCollectionCentreTimeSlots:
        | { time: string | null; is_active: boolean | null }[]
        | null
        | undefined = collectionCentres.find((collectionCentre) => {
        return collectionCentre.id === fieldCollectionCentreId;
    })?.timeSlots;

    const timeSlotLabelAndValues: [string, string][] = currentCollectionCentreTimeSlots
        ? currentCollectionCentreTimeSlots
              .filter((timeSlot) => {
                  return timeSlot.is_active;
              })
              .map((timeSlot) => {
                  return [timeSlot.time?.slice(0, -3) ?? "", timeSlot.time ?? ""];
              })
        : [];

    const defaultCollectionCentreId =
        collectionCentresNamesLabelsAndValues.length !== 0 ? fieldCollectionCentreId : "";

    const timeSlotValues = timeSlotLabelAndValues.map((slot) => {
        return slot[1];
    });

    const getDefaultCollectionSlot = useCallback((): string | null => {
        if (collectionCentresNamesLabelsAndValues.length === 0) {
            return "";
        }
        if (timeSlotValues.includes(fieldCollectionSlot ?? "") || timeSlotValues.length === 0) {
            return fieldCollectionSlot;
        }
        setFieldCollectionSlot(timeSlotValues[0]);
        return timeSlotValues[0];
    }, [timeSlotValues, collectionCentresNamesLabelsAndValues.length, fieldCollectionSlot]);

    const getDefaultCollectionDate = (): Dayjs => {
        if (fieldCollectionDate) {
            return dayjs(fieldCollectionDate, "DD/MM/YYYY");
        }
        setFieldCollectionDate(dayjs().format("DD/MM/YYYY"));
        return dayjs();
    };

    const dispatchInputFields = (): void => {
        if (!parcelHasNoCollectionCentre) {
            const collectionInfoSubmission: CollectionInfo = {
                collectionCentreId: fieldCollectionCentreId ?? "",
                collectionCentreName: fieldCollectionCentreName ?? "",
                collectionDate: fieldCollectionDate ?? "",
                collectionSlot: fieldCollectionSlot ?? "",
                collectionCentreAcronymn: fieldCollectionCentreAcronym ?? "",
            };
            dispatchBatchTableAction({
                type: "update_cell",
                updateCellPayload: {
                    rowId: id,
                    newValueAndFieldName: {
                        type: "parcel",
                        fieldName: "collectionInfo",
                        newValue: collectionInfoSubmission,
                    },
                },
            });
        } else {
            dispatchBatchTableAction({
                type: "update_cell",
                updateCellPayload: {
                    rowId: id,
                    newValueAndFieldName: {
                        type: "parcel",
                        fieldName: "collectionInfo",
                        newValue: null,
                    },
                },
            });
        }
    };

    const checkInputValidity = (): boolean => {
        let valid = true;
        if (fieldCollectionCentreId === null || fieldCollectionCentreId === "") {
            valid = false;
            setIsFieldCollectionCentreEmpty(true);
        }
        if (fieldCollectionSlot === null || fieldCollectionSlot === "") {
            valid = false;
            setIsFieldCollectionSlotEmpty(true);
        }
        return valid;
    };
    return (
        <EditCellGappedDivMargin width={COLLECTION_INFO_WIDTH}>
            {!parcelHasNoCollectionCentre && isRowCollection[id] && (
                <>
                    <ControlledSelect
                        selectLabelId="collection-centre-select-label"
                        labelsAndValues={collectionCentresNamesLabelsAndValues}
                        listTitle="Collection Centre"
                        value={defaultCollectionCentreId ?? ""}
                        onChange={(event) => {
                            const idValue = event.target.value as string;
                            setFieldCollectionCentreId(idValue);
                            const selectedCollectionCentre = collectionCentres.find(
                                (collectionCentre) => {
                                    return collectionCentre.id === idValue;
                                }
                            );
                            if (selectedCollectionCentre) {
                                setFieldCollectionCentreName(selectedCollectionCentre.name);
                                setFieldCollectionCentreAcronym(selectedCollectionCentre.acronym);
                            }
                            setIsFieldCollectionCentreEmpty(false);
                        }}
                        error={isfieldCollectionCentreEmpty}
                    />
                    <DatePicker
                        onChange={(date) => {
                            if (date) {
                                setFieldCollectionDate(date.format("DD/MM/YYYY"));
                            }
                        }}
                        label="Date"
                        defaultValue={getDefaultCollectionDate()}
                        disablePast
                    />
                    <ControlledSelect
                        selectLabelId="collection-slots-select-label"
                        onChange={(event) => {
                            const collectionSlot = event.target.value as string;
                            setFieldCollectionSlot(collectionSlot);
                            setIsFieldCollectionSlotEmpty(false);
                        }}
                        labelsAndValues={timeSlotLabelAndValues}
                        listTitle="Time Slots"
                        value={getDefaultCollectionSlot() ?? ""}
                        error={isfieldCollectionSlotEmpty}
                    />
                </>
            )}
            <FormControlLabel
                control={
                    <Checkbox
                        checked={parcelHasNoCollectionCentre || !isRowCollection[id]}
                        onChange={handleCheckCheckbox}
                        disabled={!isRowCollection[id]}
                    />
                }
                label="No collection centre"
                tabIndex={5}
            />
            <CenterComponent>
                <Button
                    variant="contained"
                    onClick={() => {
                        const areInputsValid: boolean = checkInputValidity();
                        if (areInputsValid || parcelHasNoCollectionCentre) {
                            dispatchInputFields();
                        }
                    }}
                    tabIndex={6}
                >
                    Submit
                </Button>
            </CenterComponent>
        </EditCellGappedDivMargin>
    );
};

export default CollectionInfoEditCellInput;
