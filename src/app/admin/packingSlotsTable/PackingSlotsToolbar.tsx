import {
    GridRowModes,
    GridRowModesModel,
    GridToolbarContainer,
    GridToolbarProps,
    ToolbarPropsOverrides,
} from "@mui/x-data-grid";
import React from "react";
import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add";
import { PackingSlotRow } from "./PackingSlotActions";

declare module "@mui/x-data-grid" {
    interface ToolbarPropsOverrides {
        setPackingSlotRows: React.Dispatch<React.SetStateAction<PackingSlotRow[]>>;
        setPackingSlotRowModesModel: (
            newModel: (oldModel: GridRowModesModel) => GridRowModesModel
        ) => void;
        packingSlotRows: PackingSlotRow[];
    }
}

export function EditToolbar(props: GridToolbarProps & ToolbarPropsOverrides): React.JSX.Element {
    const { setPackingSlotRows, setPackingSlotRowModesModel, packingSlotRows } = props;

    const handleClick = (): void => {
        // Include timestamp in the ID to ensure uniqueness, especially if rows are deleted and added quickly
        const id = String(packingSlotRows.length + 1) + "_" + Date.now();
        setPackingSlotRows((oldRows) => [
            ...oldRows,
            { id, name: "", isShown: false, order: Number(id), isNew: true, lastUpdated: "" },
        ]);
        setPackingSlotRowModesModel((oldModel) => ({
            ...oldModel,
            [id]: { mode: GridRowModes.Edit, fieldToFocus: "name" },
        }));
    };

    return (
        <GridToolbarContainer>
            <Button color="primary" startIcon={<AddIcon />} onClick={handleClick}>
                Add new slot
            </Button>
        </GridToolbarContainer>
    );
}
