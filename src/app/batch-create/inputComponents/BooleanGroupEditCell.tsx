import { GridRenderCellParams } from "@mui/x-data-grid";
import { BatchActionType, BatchTableDataState } from "@/app/batch-create/types";
import { useCallback } from "react";
import { booleanGroupToString } from "@/app/batch-create/helpers/displayHelpers";
import { BooleanGroup } from "@/components/DataInput/inputHandlerFactories";
import EditCellPopover from "@/app/batch-create/inputComponents/EditCellPopover";
import BooleanGroupEditCellInput from "@/app/batch-create/inputComponents/BooleanGroupEditCellInput";

export type clientBooleanGroupFields = "dietaryRequirements" | "petFood" | "otherItems";

interface BooleanGroupEditCellProps {
    gridRenderCellParams: GridRenderCellParams;
    dispatchBatchTableAction: React.Dispatch<BatchActionType>;
    tableState: BatchTableDataState;
    clientField: clientBooleanGroupFields;
    fieldWidth: number;
    booleanGroupLabelAndKeys: [string, string][];
}

const BooleanGroupEditCell: React.FC<BooleanGroupEditCellProps> = ({
    gridRenderCellParams,
    dispatchBatchTableAction,
    tableState,
    clientField,
    fieldWidth,
    booleanGroupLabelAndKeys,
}) => {
    const id = gridRenderCellParams.id as number;
    const getCurrentRowBooleanGroup = useCallback(
        (id: number): BooleanGroup => {
            return id === 0
                ? (tableState.overrideDataRow.data.client[clientField] as BooleanGroup)
                : (tableState.batchDataRows[id - 1].data.client[clientField] as BooleanGroup);
        },
        [tableState.batchDataRows, tableState.overrideDataRow.data.client, clientField]
    );

    const booleanGroupString: string = booleanGroupToString(getCurrentRowBooleanGroup(id));

    const currentBooleanGroup: BooleanGroup = getCurrentRowBooleanGroup(id) ?? {};

    const isChecked = (key: string): boolean => {
        return currentBooleanGroup ? currentBooleanGroup[key] : false;
    };

    return (
        <EditCellPopover
            id={id}
            field={gridRenderCellParams.field}
            cellValueString={booleanGroupString}
            dispatchBatchTableAction={dispatchBatchTableAction}
        >
            <BooleanGroupEditCellInput
                id={id}
                dispatchBatchTableAction={dispatchBatchTableAction}
                currentBooleanGroup={currentBooleanGroup}
                isChecked={isChecked}
                clientField={clientField}
                fieldWidth={fieldWidth}
                booleanGroupLabelAndKeys={booleanGroupLabelAndKeys}
            />
        </EditCellPopover>
    );
};

export default BooleanGroupEditCell;
