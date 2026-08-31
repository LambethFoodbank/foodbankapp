import { GridRenderEditCellParams, GridRowId } from "@mui/x-data-grid";
import React, { useLayoutEffect, useRef } from "react";

interface EditableTextAreaForDataGridProps extends GridRenderEditCellParams {
    editMode: boolean;
    handleValueChange: (value: string, id: GridRowId, field: string) => void;
}

const EditableTextAreaForDataGrid: React.FC<EditableTextAreaForDataGridProps> = ({
    id,
    field,
    value,
    editMode,
    handleValueChange,
}: EditableTextAreaForDataGridProps) => {
    const ref = useRef<HTMLTextAreaElement>(null);

    useLayoutEffect(() => {
        if (editMode && ref.current) {
            ref.current.focus();
            ref.current.setSelectionRange(value.length, value.length);
        }
    }, [editMode]); //eslint-disable-line react-hooks/exhaustive-deps
    //we don't need to pass value in as a dependancy

    return (
        <textarea
            value={value}
            onChange={(event) => handleValueChange(event.target.value, id, field)}
            ref={ref}
            style={{
                resize: "none",
                width: "100%",
                height: 150,
                borderWidth: 0,
                paddingTop: 10,
                backgroundColor: "transparent",
            }}
            onBlur={() => {
                ref.current?.setSelectionRange(value.length, value.length);
            }}
            readOnly={!editMode}
        />
    );
};

export default EditableTextAreaForDataGrid;
