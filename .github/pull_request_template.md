## What's changed
REPLACE_THIS_LINE

## Screenshots / Videos
| Before     | After      |
|------------|------------|
| paste_here | paste_here |

## Checklist
- [ ] The ticket is up-to-date - Please document any deviations from the original approach if there is any.
- [ ] I have documented the testing steps for QA
- [ ] I have self-reviewed this PR
- [ ] I have checked that any E2E tests do not assume that the database contains specific data, unless set by migration
- [ ] Make sure you've verified it works via `npm run dev`
- [ ] Make sure you've verified it works via `npm run build` and `npm run start`
- [ ] Make sure you've fixed all linting problems with `npm run lint_fix`
- [ ] Make sure you've tested via `npm run test`

If you have made any changes to the database...
  - [ ] I have checked that no concurrency issues can occur, and all situations where they might arise (e.g. modifying the same value in multiple places simultaneously) have been properly handled.
  - [ ] The migration files are up-to-date with my final set up (`npx supabase db diff -f <name_of_migration>` should create nothing at this point)
  - [ ] I have updated the typescript definitions for the database with `npm run generate_types:local`
  - [ ] I have modified the seed in `supabase/seed/seed.ts` if appropriate
  - [ ] If I have modified the seed, I have also generated the seed with `npm run db:generate_seed` 
  - [ ] With my final set up, I can run `npm run reset_supabase` without any errors.
  - [ ] (Just before merging the ticket) I have updated the timestamps of the new migration files so that they are after all existing migration files.
  - [ ] I have taken reasonable measures to ensure constraint violations do not happen when the migration occurs, e.g.:
    - audit_log FK constraints that could be violated
    - any constraints that I have added, e.g. `set not null`
  - [ ] I have checked that migration can happen successfully without resetting the database, doing the following.
    - Make sure you have rebased your branch onto dev or merged dev into your branch.
    - Checkout the dev branch
    - Run `npm run post_checkout` to reset the database, including the seed data.
    - Checkout your branch
    - Run `npx supabase migrations up --include-all --local` to run all outstanding migration files
    - Check that the resulting database is what you expect, bar any seed data changes.

