import supabase from "@/supabaseClient";
import { PostgrestError } from "@supabase/supabase-js";
import { WikiRowQueryType } from "@/app/info/AddWikiItemButton";

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
    key: string
): Promise<PostgrestError | null> {
    const updateResponse = (await supabase.from("wiki").upsert({
        title: newTitle,
        content: newContent,
        wiki_key: key,
    })) as WikiRowQueryType;

    return updateResponse.error;
}

export async function createItemInWikiTable(): Promise<WikiRowQueryType> {
    const insertResponse = (await supabase
        .from("wiki")
        .insert({})
        .select()
        .single()) as WikiRowQueryType;

    return insertResponse;
}
