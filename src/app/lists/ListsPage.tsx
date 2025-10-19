"use client";

import React, { useCallback, useEffect, useState, useRef } from "react";
import { Schema } from "@/databaseUtils";
import supabase from "@/supabaseClient";
import {
    FetchListsCommentError,
    FetchListsError,
    fetchListsComment,
    fetchLists,
} from "@/common/fetch";
import { LIST_TYPES_ARRAY } from "@/common/databaseListTypes";
import ListsDataView, {
    ListRow,
    listsHeaderKeysAndLabels,
    ListFilter,
} from "@/app/lists/ListDataview";
import { ErrorSecondaryText } from "../errorStylingandMessages";
import { subscriptionStatusRequiresErrorMessage } from "@/common/subscriptionStatusRequiresErrorMessage";
import { clientSideButtonGroupFilter, filterRowbyButton } from "@/components/Tables/ButtonFilter";
import { buildClientSideTextFilter, filterRowByText } from "@/components/Tables/TextFilter";

interface FetchedListsData {
    listsData: Schema["lists"][];
    comment: string;
}

type FetchListsDataResponse =
    | {
          data: FetchedListsData;
          error: null;
      }
    | {
          data: null;
          error: FetchListsError | FetchListsCommentError;
      };

const fetchListsData = async (): Promise<FetchListsDataResponse> => {
    const { data: listsData, error: listsError } = await fetchLists(supabase);
    if (listsError) {
        return { data: null, error: listsError };
    }
    const { data: listsCommentData, error: listsCommentError } = await fetchListsComment(supabase);
    if (listsCommentError) {
        return { data: null, error: listsCommentError };
    }
    return { data: { listsData: listsData, comment: listsCommentData }, error: null };
};

const getErrorMessage = (error: FetchListsError | FetchListsCommentError): string => {
    let errorMessage: string;
    switch (error.type) {
        case "listsFetchFailed":
            errorMessage = "Failed to fetch lists data.";
            break;
        case "listsCommentFetchFailed":
            errorMessage = "Failed to fetch lists comment.";
            break;
    }
    return `${errorMessage} Log ID: ${error.logId}`;
};

const formatListData = (listsData: Schema["lists"][]): ListRow[] => {
    return listsData.map(
        (row) =>
            ({
                primaryKey: row.primary_key,
                listType: row.list_type,
                rowOrder: row.row_order,
                itemName: row.item_name,
                ...Object.fromEntries(
                    listsHeaderKeysAndLabels
                        .filter(([key]) => /^\d+$/.test(key))
                        .map(([key]) => [
                            key,
                            {
                                quantity: row[`quantity_for_${key}` as keyof Schema["lists"]],
                                notes: row[`notes_for_${key}` as keyof Schema["lists"]],
                            },
                        ])
                ),
            }) as ListRow // this cast is needed here as the type system can't infer what Object.fromEntries will return
    );
};

const filters: ListFilter[] = [
    buildClientSideTextFilter({
        key: "itemName",
        rowKey: "itemName",
        label: "Item",
        method: filterRowByText,
    }),
    clientSideButtonGroupFilter({
        key: "listType",
        rowKey: "listType",
        filterLabel: "",
        itemLabelsAndKeys: LIST_TYPES_ARRAY.map((type) => [type, type]),
        initialActiveFilter: "regular",
        method: filterRowbyButton,
        shouldPersistOnClear: true,
    }),
];

const ListsPage: React.FC = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [listData, setListData] = useState<ListRow[]>([]);
    const [comment, setComment] = useState("");
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const listsTableFetchAbortController = useRef<AbortController | null>(null);
    const [primaryFilters, setPrimaryFilters] = useState<ListFilter[]>(filters);
    const latestFetchRequestId = useRef<number>(0);

    function handleSetError(error: string | null): void {
        setErrorMessage(error);
    }

    const fetchAndSetData = useCallback(async (): Promise<void> => {
        setIsLoading(true);

        latestFetchRequestId.current += 1;
        const currentFetchRequestId = latestFetchRequestId.current;

        if (listsTableFetchAbortController.current) {
            listsTableFetchAbortController.current.abort("stale request");
        }
        listsTableFetchAbortController.current = new AbortController();

        setErrorMessage(null);
        const { data, error } = await fetchListsData();

        if (currentFetchRequestId === latestFetchRequestId.current) {
            if (error) {
                setIsLoading(false);
                setErrorMessage(getErrorMessage(error));
                return;
            }

            setListData(formatListData(data.listsData));
            setComment(data.comment);
        }

        listsTableFetchAbortController.current = null;
        setIsLoading(false);
    }, [setIsLoading, setErrorMessage, setListData, setComment]);

    useEffect(() => {
        fetchAndSetData();
    }, [fetchAndSetData]);

    useEffect(() => {
        const subscriptionChannel = supabase
            .channel("lists-table-changes")
            .on("postgres_changes", { event: "*", schema: "public", table: "lists" }, async () => {
                await fetchAndSetData();
            })
            .subscribe((status, err) => {
                if (subscriptionStatusRequiresErrorMessage(status, err, "lists")) {
                    setErrorMessage("Failed to fetch lists data, please reload");
                } else {
                    setErrorMessage(null);
                }
            });
        return () => {
            void supabase.removeChannel(subscriptionChannel);
        };
    }, [fetchAndSetData]);

    return isLoading ? (
        <></>
    ) : errorMessage ? (
        <ErrorSecondaryText>{errorMessage}</ErrorSecondaryText>
    ) : (
        <ListsDataView
            listOfIngredients={listData}
            setListOfIngredients={setListData}
            comment={comment}
            errorMessage={errorMessage}
            setErrorMessage={handleSetError}
            primaryFilters={primaryFilters}
            setPrimaryFilters={setPrimaryFilters}
        />
    );
};

export default ListsPage;
