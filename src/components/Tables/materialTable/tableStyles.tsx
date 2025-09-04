import styled, { DefaultTheme } from "styled-components";
import { TableBodyProps, TableCellProps } from "@mui/material";

export const defaultColumnStyleOptions = {
    grow: 1,
    minWidth: "2rem",
    maxWidth: "20rem",
};

export const EditAndReorderArrowDiv = styled.div`
    display: flex;
    flex-direction: row;
    width: 100%;
    transform: translateX(-0.8rem);
`;

export const RelativeContainerForTable = styled.div`
    position: relative;
`;

export const ColumnSelectorContainer = styled.div`
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    z-index: 900;
`;

export const muiTablePaperProps = {
    sx: {
        margin: "0 !important",
    },
};

export const muiTableProps = {
    sx: {
        tableLayout: "fixed",
        width: "100%",
        borderCollapse: "collapse",
    },
};

export const muiTableHeadCellProps = (theme: DefaultTheme): TableCellProps => ({
    sx: {
        backgroundColor: theme.main.background[2],
        color: theme.main.foreground[2],
        fontSize: "1rem",
        fontWeight: "bold",
        borderColor: theme.main.border,
        whiteSpace: "normal",
        wordBreak: "break-word",
        overflowWrap: "anywhere",
    },
});

export const muiTableBodyProps = (theme: DefaultTheme): TableBodyProps => ({
    sx: {
        "& tr:nth-of-type(even) > td": {
            backgroundColor: theme.main.background[0],
        },
        "& tr:nth-of-type(odd) > td": {
            backgroundColor: theme.main.background[1],
        },
    },
});

export const muiTableBodyCellProps = {
    sx: {
        whiteSpace: "normal",
        wordBreak: "break-word",
    },
};

export const displayColumnDefOptions = {
    "mrt-row-drag": {
        header: "",
        size: 0,
        enableSorting: false,
    },
    "mrt-row-actions": {
        header: "",
        minSize: 80,
    },
    "mrt-row-select": {
        size: 2,
        enableSorting: false,
    },
};
