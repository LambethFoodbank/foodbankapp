import registerCodeCoverageTasks from "@cypress/code-coverage/task";
import { defineConfig } from "cypress";

import * as dotenv from "dotenv";

dotenv.config({ path: "./.env.local" });

export default defineConfig({
    e2e: {
        setupNodeEvents(on, config) {
            // implement node event listeners here
            registerCodeCoverageTasks(on, config);

            on("task", {
                log: (message: unknown): null => {
                    console.log(message);
                    return null;
                },
            });

            if (
                process.env.NEXT_PUBLIC_CYPRESS_TEST_USER === undefined ||
                process.env.NEXT_PUBLIC_CYPRESS_TEST_PASS === undefined
            ) {
                throw new Error(
                    "CYPRESS_TEST_USER and CYPRESS_TEST_PASS must be set in .env.local"
                );
            } else if (
                process.env.NEXT_PUBLIC_CYPRESS_TEST_ADMIN_USER === undefined ||
                process.env.NEXT_PUBLIC_CYPRESS_TEST_ADMIN_PASS === undefined
            ) {
                throw new Error(
                    "CYPRESS_TEST_ADMIN_USER and CYPRESS_TEST_ADMIN_PASS must be set in .env.local"
                );
            } else if (
                process.env.NEXT_PUBLIC_CYPRESS_TEST_STAFF_USER === undefined ||
                process.env.NEXT_PUBLIC_CYPRESS_TEST_STAFF_PASS === undefined
            ) {
                throw new Error(
                    "CYPRESS_TEST_STAFF_USER and CYPRESS_TEST_STAFF_PASS must be set in .env.local"
                );
            }

            config.env = {
                TEST_USER: process.env.NEXT_PUBLIC_CYPRESS_TEST_USER,
                TEST_PASS: process.env.NEXT_PUBLIC_CYPRESS_TEST_PASS,
                TEST_ADMIN_USER: process.env.NEXT_PUBLIC_CYPRESS_TEST_ADMIN_USER,
                TEST_ADMIN_PASS: process.env.NEXT_PUBLIC_CYPRESS_TEST_ADMIN_PASS,
                TEST_STAFF_USER: process.env.NEXT_PUBLIC_CYPRESS_TEST_STAFF_USER,
                TEST_STAFF_PASS: process.env.NEXT_PUBLIC_CYPRESS_TEST_STAFF_PASS,
            };

            return config;
        },
        baseUrl: "http://localhost:3200",
        video: true,
        screenshotOnRunFailure: true,
    },
});
