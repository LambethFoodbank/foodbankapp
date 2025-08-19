import { getInactiveClientCountByParcelIds } from "@/app/parcels/parcelsTable/fetchParcelTableData";

export const getDeletedClientParcelsCount = async (
    parcelIds: string[],
    dataCallback: (count: number) => void,
    errorCallback: (msg: string) => void
): Promise<void> => {
    const { data, error } = await getInactiveClientCountByParcelIds(parcelIds);

    if (error) {
        errorCallback(`Failed to fetch deleted client parcels count: ${error.type}`);
        return;
    }
    if (data === null) {
        errorCallback("No data returned for deleted client parcels count.");
        return;
    }

    dataCallback(data);
};
