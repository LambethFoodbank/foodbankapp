"use client";

import DriversTable from "./driversTable/DriversTable";
import TableSurface from "@/components/Tables/TableSurface";

export default function DriversPage(): React.JSX.Element {
    return (
        <div>
            <div>
                <TableSurface>
                    <DriversTable />
                </TableSurface>
            </div>
        </div>
    );
}
