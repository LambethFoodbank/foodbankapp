import {
    GridRowModes,
    GridRowModesModel,
    GridRowsProp,
    GridToolbarContainer,
    GridToolbarProps,
    ToolbarPropsOverrides,
} from "@mui/x-data-grid";
import React from "react";
import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add";
import { CollectionCentresTableRow } from "@/app/admin/collectionCentresTable/CollectionCentreActions";

// interface EditToolbarProps {
// setRows: (newRows: (oldRows: GridRowsProp) => GridRowsProp) => void;
// setRowModesModel: (newModel: (oldModel: GridRowModesModel) => GridRowModesModel) => void;
// rows: CollectionCentresTableRow[];
// }

declare module "@mui/x-data-grid" {
    interface ToolbarPropsOverrides {
        setRows: (newRows: (oldRows: GridRowsProp) => GridRowsProp) => void;
        //        setRows: React.Dispatch<React.SetStateAction<CollectionCentresTableRow[]>>;

        setRowModesModel: (newModel: (oldModel: GridRowModesModel) => GridRowModesModel) => void;
        rows: CollectionCentresTableRow[];
    }
}

// type EditToolbarProps = GridToolbarProps &
//     ToolbarPropsOverrides & {
//         setRows: (newRows: (oldRows: GridRowsProp) => GridRowsProp) => void;
//         setRowModesModel: (newModel: (oldModel: GridRowModesModel) => GridRowModesModel) => void;
//         rows: CollectionCentresTableRow[];
//     };

export function EditToolbar(props: GridToolbarProps & ToolbarPropsOverrides): React.JSX.Element {
    const { setRows, setRowModesModel, rows } = props;

    const handleClick = (): void => {
        const id = rows.length + 1;
        setRows((oldRows) => [...oldRows, { id, name: "", isShown: false, isNew: true }]);
        setRowModesModel((oldModel) => ({
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
