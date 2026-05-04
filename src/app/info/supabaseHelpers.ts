import supabase from "@/supabaseClient";
import { PostgrestError } from "@supabase/supabase-js";
import { WikiRowQueryType } from "@/app/info/AddWikiItemButton";
import { DbWikiRow } from "@/databaseUtils";

export async function reorderTwoItemsInWikiTable(
    key1: string,
    key2: string
): Promise<PostgrestError | null> {
    const { error } = await supabase.rpc("swap_two_wiki_rows", {
        key1: key1,
        key2: key2,
    });

    return error;
}
export async function fetchWikiRow(wiki_key: string): Promise<DbWikiRow> {
    const { data, error } = await supabase
        .from("wiki")
        .select("*")
        .eq("wiki_key", wiki_key)
        .single();

    if (error || !data) {
        throw new Error(error?.message || "Row not found");
    }

    return data;
}

export async function deleteItemInWikiTable(wiki_key: string): Promise<PostgrestError | null> {
    const deleteResponse = (await supabase
        .from("wiki")
        .delete()
        .match({ wiki_key })) as WikiRowQueryType;

    return deleteResponse.error;
}

export async function updateItemInWikiTable(
    newTitle: string,
    newContent: string,
    key: string,
    originalLastUpdated: string
): Promise<PostgrestError | null> {
    const { data, error, count } = await supabase
        .from("wiki")
        .update({ title: newTitle, content: newContent }, { count: "exact" })
        .eq("wiki_key", key)
        .eq("last_updated", originalLastUpdated)
        .select("*");
    if (error) {
        return error;
    }
    if (count === 0 || data.length === 0) {
        return {
            message: "Record has been edited recently - please refresh the page.",
            details: "",
            hint: "",
            code: "",
        };
    }

    return null;
}

export async function createItemInWikiTable(): Promise<WikiRowQueryType> {
    const insertResponse = (await supabase
        .from("wiki")
        .insert({})
        .select()
        .single()) as WikiRowQueryType;

    return insertResponse;
}
