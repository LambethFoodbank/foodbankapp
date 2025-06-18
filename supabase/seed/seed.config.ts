import { SeedPostgres } from "@snaplet/seed/adapter-postgres";
import { defineConfig } from "@snaplet/seed/config";
import postgres from "postgres";

export default defineConfig({
    adapter: () => {
        const client = postgres("postgresql://postgres:postgres@localhost:54322/postgres");
        return new SeedPostgres(client);
    },
});
