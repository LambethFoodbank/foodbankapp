import { DataGrid, DataGridProps } from "@mui/x-data-grid";
import { styled } from "styled-components";
import React from "react";

const DataGridStyling = styled(DataGrid)`
    &.dietary-table {
        & .MuiDataGrid-cellContent {
            padding: 0.5rem;
            min-height: 56px;
            align-content: center;
        }
    }

    & > div {
        border-radius: 1rem;
        border: 0px;
    }

    & .MuiDataGrid-columnHeaders {
        background-color: ${(props) => props.theme.main.background[2]};
        border-color: ${(props) => props.theme.main.border};
        text-align: start;
        font-size: 1rem;
    }

    & .datagrid-row-even {
        text-align: start;
        font-size: 1rem;
        background-color: ${(props) => props.theme.main.background[1]};
        color: ${(props) => props.theme.main.foreground[2]};
    }

    & .datagrid-row-odd {
        text-align: start;
        font-size: 1rem;
        background-color: ${(props) => props.theme.main.background[0]};
        color: ${(props) => props.theme.main.foreground[2]};
    }

    & .MuiDataGrid-virtualScrollerRenderZone {
        & :hover {
            background-color: ${(props) => props.theme.primary.background[1]};
        }
    }
`;

const StyledDataGrid: React.FC<DataGridProps> = (props) => <DataGridStyling {...props} />;

export default StyledDataGrid;
