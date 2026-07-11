import { GridColumnHeaderParams, GridValidRowModel } from "@mui/x-data-grid";
import React from "react";

const Header = <Data extends GridValidRowModel>({
    colDef,
}: GridColumnHeaderParams<Data>): React.ReactElement<any> => {
    return colDef.headerName ? (
        <p style={{ fontWeight: "bold" }}>
            {`${colDef.headerName[0].toUpperCase()}${colDef.headerName.slice(1)}`}
        </p>
    ) : (
        <></>
    );
};
export default Header;
