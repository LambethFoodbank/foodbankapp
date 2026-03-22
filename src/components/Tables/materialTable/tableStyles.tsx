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
    tabIndex: 0,
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
        padding: "0.5rem",
        fontSize: "1rem",
        fontWeight: "bold",
        borderColor: theme.main.border,
        whiteSpace: "normal",
        wordBreak: "normal",
        overflowWrap: "normal",

        "& .Mui-TableHeadCell-Content-Wrapper": {
            whiteSpace: "normal",
            textOverflow: "clip",
            overflow: "visible",
        },
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
        padding: "0.5rem",
        fontSize: "1rem",
        lineHeight: "normal",
        whiteSpace: "normal",
        wordBreak: "break-word",
    },
};

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const displayColumnDefOptions = (theme: DefaultTheme) => ({
    "mrt-row-drag": {
        size: 0,
        align: "right",
        enableSorting: false,
        muiTableHeadCellProps: {
            sx: {
                ...muiTableHeadCellProps(theme).sx,
                color: "rgb(0, 0, 0, 0)", // tranparent header text
            },
        },
    },
    "mrt-row-actions": {
        minSize: 80,
        muiTableHeadCellProps: {
            sx: {
                ...muiTableHeadCellProps(theme).sx,
                color: "rgb(0, 0, 0, 0)", // tranparent header text
            },
        },
    },
    "mrt-row-select": {
        size: 40,
        shrink: 0,
        enableSorting: false,
        muiTableHeadCellProps: {
            sx: {
                ...muiTableHeadCellProps(theme).sx,
                width: "2rem",
                minWidth: "1.5rem",
            },
        },
    },
});
