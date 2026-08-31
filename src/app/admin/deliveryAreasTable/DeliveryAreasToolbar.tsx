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
import { DeliveryAreasRow } from "./DeliveryAreasActions";

declare module "@mui/x-data-grid" {
    interface ToolbarPropsOverrides {
        setDeliveryAreasRows: React.Dispatch<React.SetStateAction<DeliveryAreasRow[]>>;
        setDeliveryAreasRowModesModel: (
            newModel: (oldModel: GridRowModesModel) => GridRowModesModel
        ) => void;
        deliveryAreasRows: DeliveryAreasRow[];
    }
}

export function EditToolbar(props: GridToolbarProps & ToolbarPropsOverrides): React.JSX.Element {
    const { setDeliveryAreasRows, setDeliveryAreasRowModesModel, deliveryAreasRows } = props;

    const handleClick = (): void => {
        // Include timestamp in the ID to ensure uniqueness, especially if rows are deleted and added quickly
        const id = String(deliveryAreasRows.length + 1) + "_" + Date.now();
        setDeliveryAreasRows((oldRows) => [
            ...oldRows,
            { id, postcode: "", postcodeSortKey: "", isNew: true },
        ]);
        setDeliveryAreasRowModesModel((oldModel) => ({
            ...oldModel,
            [id]: { mode: GridRowModes.Edit, fieldToFocus: "postcode" },
        }));
    };

    return (
        <GridToolbarContainer>
            <Button color="primary" startIcon={<AddIcon />} onClick={handleClick}>
                Add new area
            </Button>
        </GridToolbarContainer>
    );
}
