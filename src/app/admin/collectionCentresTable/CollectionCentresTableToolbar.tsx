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
import {
    CollectionCentresTableRow,
    initialCollectionAvailableDays,
} from "@/app/admin/collectionCentresTable/CollectionCentreActions";

declare module "@mui/x-data-grid" {
    interface ToolbarPropsOverrides {
        setCollectionCentreRows: React.Dispatch<React.SetStateAction<CollectionCentresTableRow[]>>;
        setCollectionCentreRowModesModel: (
            newModel: (oldModel: GridRowModesModel) => GridRowModesModel
        ) => void;
        collectionCentreRows: CollectionCentresTableRow[];
    }
}

export function EditToolbar(props: GridToolbarProps & ToolbarPropsOverrides): React.JSX.Element {
    const { setCollectionCentreRows, setCollectionCentreRowModesModel, collectionCentreRows } =
        props;

    const handleClick = (): void => {
        // Include timestamp in the ID to ensure uniqueness, especially if rows are deleted and added quickly
        const id = String(collectionCentreRows.length + 1) + "_" + Date.now();
        setCollectionCentreRows((oldRows) => [
            ...oldRows,
            {
                id,
                name: "",
                acronym: "",
                isShown: false,
                isDelivery: false,
                timeSlots: [],
                availableDays: initialCollectionAvailableDays,
                isNew: true,
                lastUpdated: "",
            },
        ]);
        setCollectionCentreRowModesModel((oldModel) => ({
            ...oldModel,
            [id]: { mode: GridRowModes.Edit, fieldToFocus: "name" },
        }));
    };

    return (
        <GridToolbarContainer>
            <Button color="primary" startIcon={<AddIcon />} onClick={handleClick}>
                Add a new collection centre
            </Button>
        </GridToolbarContainer>
    );
}
