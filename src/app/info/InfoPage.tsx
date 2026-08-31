import React from "react";
import WikiItems from "@/app/info/WikiItems";
import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/databaseTypesFile";
import { logErrorReturnLogId } from "@/logger/logger";
import { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";
import { WikiRowsQueryType } from "@/common/fetch";

async function getWikiRows(): Promise<WikiRowsQueryType> {
    const cookieStore: ReadonlyRequestCookies = await cookies();
    const supabase = createServerComponentClient<Database>({ cookies: () => cookieStore });
    const query = (await supabase.from("wiki").select("*")) as WikiRowsQueryType;
    return query;
}

const InfoPage: React.FC = async () => {
    const { data, error }: WikiRowsQueryType = await getWikiRows();
    if (error) {
        logErrorReturnLogId("error fetching wiki data", error);
    }
    return error ? <h3>Error occured when fetching data.</h3> : <WikiItems rows={data} />;
};

export default InfoPage;
